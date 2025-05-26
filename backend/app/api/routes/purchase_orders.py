from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.purchase_order import (
    PurchaseOrder, 
    PurchaseOrderReceipt, 
    PurchaseOrderReceiptItem,
    purchase_order_items  # Añadir esta importación
)
from app.models.supplier import Supplier
from app.models.product import Product
from app.schemas.purchase_order import (
    PurchaseOrder as PurchaseOrderSchema,
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    Receipt,
    ReceiptCreate
)

router = APIRouter()



# Generar número de orden único
def generate_order_number(db: Session):
    # Obtener el año actual
    current_year = func.extract('year', func.current_date())
    
    # Contar cuántas órdenes hay este año
    count = db.query(func.count(PurchaseOrder.id))\
        .filter(func.extract('year', PurchaseOrder.order_date) == current_year)\
        .scalar()
    
    # Formatear como "PO-YYYY-XXXX"
    year = func.extract('year', func.current_date()).scalar_subquery()
    return f"PO-{year}-{(count + 1):04d}"

@router.get("/", response_model=dict)
async def get_purchase_orders(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    supplier_id: Optional[int] = Query(None, description="Filtrar por proveedor"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    from_date: Optional[str] = Query(None, description="Fecha inicial (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="Fecha final (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de órdenes de compra con paginación y filtros opcionales.
    """
    # Calcular el offset basado en la página y el límite
    skip = (page - 1) * limit
    
    # Construir la consulta base
    query = db.query(PurchaseOrder).join(Supplier)
    
    # Aplicar filtros si se proporcionaron
    if supplier_id:
        query = query.filter(PurchaseOrder.supplier_id == supplier_id)
    if status:
        query = query.filter(PurchaseOrder.status == status)
    if from_date:
        query = query.filter(PurchaseOrder.order_date >= from_date)
    if to_date:
        query = query.filter(PurchaseOrder.order_date <= to_date)
    
    # Ordenar por fecha de orden (más reciente primero)
    query = query.order_by(PurchaseOrder.order_date.desc())
    
    # Obtener el total de registros para la paginación
    total = query.count()
    
    # Aplicar paginación
    purchase_orders = query.offset(skip).limit(limit).all()
    
    # Enriquecer datos
    result_orders = []
    for order in purchase_orders:
        order_data = {
            "id": order.id,
            "order_number": order.order_number,
            "supplier_id": order.supplier_id,
            "supplier_name": order.supplier.name if order.supplier else None,
            "order_date": order.order_date,
            "expected_delivery_date": order.expected_delivery_date,
            "status": order.status,
            "total_amount": order.total_amount,
            "payment_terms": order.payment_terms,
            "shipping_method": order.shipping_method,
            "notes": order.notes,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "items": []
        }
        
        # Obtener items de la orden
        items_query = db.query(
            purchase_order_items.c.id,
            purchase_order_items.c.product_id,
            Product.name.label("product_name"),
            purchase_order_items.c.quantity,
            purchase_order_items.c.unit_price,
            purchase_order_items.c.subtotal,
            purchase_order_items.c.notes
        ).join(
            Product, purchase_order_items.c.product_id == Product.id
        ).filter(
            purchase_order_items.c.purchase_order_id == order.id
        )
        
        items = items_query.all()
        for item in items:
            order_data["items"].append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
                "notes": item.notes
            })
        
        result_orders.append(order_data)
    
    # Calcular total de páginas
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "items": result_orders,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.post("/", response_model=PurchaseOrderSchema, status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    order: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva orden de compra.
    """
    # Verificar que el proveedor existe
    supplier = db.query(Supplier).filter(Supplier.id == order.supplier_id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proveedor no encontrado"
        )
    
    # Generar número de orden único
    order_number = generate_order_number(db)
    
    # Calcular total de la orden
    total_amount = 0
    for item in order.items:
        subtotal = item.quantity * item.unit_price
        total_amount += subtotal
    
    # Crear la orden
    db_order = PurchaseOrder(
        order_number=order_number,
        supplier_id=order.supplier_id,
        expected_delivery_date=order.expected_delivery_date,
        payment_terms=order.payment_terms,
        shipping_method=order.shipping_method,
        notes=order.notes,
        total_amount=total_amount,
        status="pending"
    )
    
    db.add(db_order)
    db.flush()  # Para obtener el ID asignado
    
    # Añadir los elementos de la orden
    for item in order.items:
        # Verificar que el producto existe
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {item.product_id} no encontrado"
            )
        
        # Calcular subtotal
        subtotal = item.quantity * item.unit_price
        
        # Añadir elemento a la orden
        db.execute(
            purchase_order_items.insert().values(
                purchase_order_id=db_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=subtotal,
                notes=item.notes
            )
        )
    
    db.commit()
    db.refresh(db_order)
    
    # Preparar respuesta
    result = {
        "id": db_order.id,
        "order_number": db_order.order_number,
        "supplier_id": db_order.supplier_id,
        "supplier_name": supplier.name,
        "order_date": db_order.order_date,
        "expected_delivery_date": db_order.expected_delivery_date,
        "status": db_order.status,
        "total_amount": db_order.total_amount,
        "payment_terms": db_order.payment_terms,
        "shipping_method": db_order.shipping_method,
        "notes": db_order.notes,
        "created_at": db_order.created_at,
        "updated_at": db_order.updated_at,
        "items": []
    }
    
    # Obtener items para la respuesta
    items_query = db.query(
        purchase_order_items.c.id,
        purchase_order_items.c.product_id,
        Product.name.label("product_name"),
        purchase_order_items.c.quantity,
        purchase_order_items.c.unit_price,
        purchase_order_items.c.subtotal,
        purchase_order_items.c.notes
    ).join(
        Product, purchase_order_items.c.product_id == Product.id
    ).filter(
        purchase_order_items.c.purchase_order_id == db_order.id
    )
    
    items = items_query.all()
    for item in items:
        result["items"].append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
            "notes": item.notes
        })
    
    return result

@router.get("/{order_id}", response_model=PurchaseOrderSchema)
async def get_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener una orden de compra por su ID.
    """
    # Buscar la orden
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    
    # Verificar si existe
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden de compra no encontrada"
        )
    
    # Obtener datos del proveedor
    supplier = db.query(Supplier).filter(Supplier.id == order.supplier_id).first()
    
    # Preparar respuesta
    result = {
        "id": order.id,
        "order_number": order.order_number,
        "supplier_id": order.supplier_id,
        "supplier_name": supplier.name if supplier else None,
        "order_date": order.order_date,
        "expected_delivery_date": order.expected_delivery_date,
        "status": order.status,
        "total_amount": order.total_amount,
        "payment_terms": order.payment_terms,
        "shipping_method": order.shipping_method,
        "notes": order.notes,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": []
    }
    
    # Obtener items de la orden
    items_query = db.query(
        purchase_order_items.c.id,
        purchase_order_items.c.product_id,
        Product.name.label("product_name"),
        purchase_order_items.c.quantity,
        purchase_order_items.c.unit_price,
        purchase_order_items.c.subtotal,
        purchase_order_items.c.notes
    ).join(
        Product, purchase_order_items.c.product_id == Product.id
    ).filter(
        purchase_order_items.c.purchase_order_id == order.id
    )
    
    items = items_query.all()
    for item in items:
        result["items"].append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
            "notes": item.notes
        })
    
    return result

@router.put("/{order_id}", response_model=PurchaseOrderSchema)
async def update_purchase_order(
    order_id: int,
    order_update: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar una orden de compra existente.
    """
    # Buscar la orden
    db_order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    
    # Verificar si existe
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden de compra no encontrada"
        )
    
    # Solo permitir actualización de órdenes pendientes o aprobadas
    if db_order.status not in ["pending", "approved"] and "status" in order_update.dict(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede actualizar una orden con estado '{db_order.status}'"
        )
    
        # Actualizar los campos de la orden
    update_data = order_update.dict(exclude_unset=True)
    
    # Si se está cambiando el proveedor, verificar que existe
    if "supplier_id" in update_data:
        supplier = db.query(Supplier).filter(Supplier.id == update_data["supplier_id"]).first()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado"
            )
    
    # Actualizar los campos de la orden
    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    
    # Preparar respuesta
    result = {
        "id": db_order.id,
        "order_number": db_order.order_number,
        "supplier_id": db_order.supplier_id,
        "supplier_name": db_order.supplier.name if db_order.supplier else None,
        "order_date": db_order.order_date,
        "expected_delivery_date": db_order.expected_delivery_date,
        "status": db_order.status,
        "total_amount": db_order.total_amount,
        "payment_terms": db_order.payment_terms,
        "shipping_method": db_order.shipping_method,
        "notes": db_order.notes,
        "created_at": db_order.created_at,
        "updated_at": db_order.updated_at,
        "items": []
    }
    
    # Obtener items de la orden
    items_query = db.query(
        purchase_order_items.c.id,
        purchase_order_items.c.product_id,
        Product.name.label("product_name"),
        purchase_order_items.c.quantity,
        purchase_order_items.c.unit_price,
        purchase_order_items.c.subtotal,
        purchase_order_items.c.notes
    ).join(
        Product, purchase_order_items.c.product_id == Product.id
    ).filter(
        purchase_order_items.c.purchase_order_id == db_order.id
    )
    
    items = items_query.all()
    for item in items:
        result["items"].append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
            "notes": item.notes
        })
    
    return result

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar una orden de compra.
    """
    # Buscar la orden
    db_order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    
    # Verificar si existe
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden de compra no encontrada"
        )
    
    # Solo permitir eliminación de órdenes pendientes
    if db_order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar una orden con estado '{db_order.status}'"
        )
    
    # Eliminar la orden (los items se eliminarán en cascada por la relación)
    db.delete(db_order)
    db.commit()
    
    return None

@router.post("/{order_id}/receive", response_model=Receipt)
async def receive_order(
    order_id: int,
    receipt_data: ReceiptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar la recepción de productos de una orden de compra.
    """
    # Buscar la orden
    db_order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    
    # Verificar si existe
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden de compra no encontrada"
        )
    
    # Solo permitir recepción de órdenes aprobadas o parcialmente recibidas
    if db_order.status not in ["approved", "partially_received"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede recibir una orden con estado '{db_order.status}'"
        )
    
    # Obtener los items actuales de la orden
    items_query = db.query(
        purchase_order_items.c.product_id,
        purchase_order_items.c.quantity
    ).filter(
        purchase_order_items.c.purchase_order_id == db_order.id
    )
    
    order_items = {item.product_id: item.quantity for item in items_query.all()}
    
    # Verificar que todos los productos recibidos están en la orden
    for receipt_item in receipt_data.items:
        if receipt_item.product_id not in order_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Producto con ID {receipt_item.product_id} no está en la orden"
            )
    
    # Crear el registro de recepción
    receipt = PurchaseOrderReceipt(
        purchase_order_id=order_id,
        received_by=receipt_data.received_by or current_user.id,
        notes=receipt_data.notes,
        status="partial"  # Inicialmente asumimos recepción parcial
    )
    
    db.add(receipt)
    db.flush()  # Para obtener el ID asignado
    
    # Añadir los items recibidos
    total_expected = 0
    total_received = 0
    
    for receipt_item in receipt_data.items:
        # Añadir el item recibido
        db_receipt_item = PurchaseOrderReceiptItem(
            receipt_id=receipt.id,
            product_id=receipt_item.product_id,
            quantity_received=receipt_item.quantity_received,
            quantity_rejected=receipt_item.quantity_rejected or 0,
            rejection_reason=receipt_item.rejection_reason
        )
        
        db.add(db_receipt_item)
        
        # Actualizar el inventario (esto debería hacerse en un servicio aparte)
        # Aquí simplemente aumentamos el stock del producto
        product = db.query(Product).filter(Product.id == receipt_item.product_id).first()
        if product:
            product.stock_quantity = (product.stock_quantity or 0) + receipt_item.quantity_received
        
        # Sumar para determinar si es recepción completa
        total_expected += order_items[receipt_item.product_id]
        total_received += receipt_item.quantity_received
    
    # Determinar si es recepción completa
    all_items_received = total_received >= total_expected
    receipt.status = "complete" if all_items_received else "partial"
    
    # Actualizar el estado de la orden
    if all_items_received:
        db_order.status = "received"
    else:
        db_order.status = "partially_received"
    
    db.commit()
    db.refresh(receipt)
    
    # Preparar respuesta
    result = {
        "id": receipt.id,
        "purchase_order_id": receipt.purchase_order_id,
        "receipt_date": receipt.receipt_date,
        "received_by": receipt.received_by,
        "status": receipt.status,
        "notes": receipt.notes,
        "items": []
    }
    
    # Obtener items para la respuesta
    receipt_items_query = db.query(
        PurchaseOrderReceiptItem.id,
        PurchaseOrderReceiptItem.product_id,
        Product.name.label("product_name"),
        PurchaseOrderReceiptItem.quantity_received,
        PurchaseOrderReceiptItem.quantity_rejected,
        PurchaseOrderReceiptItem.rejection_reason
    ).join(
        Product, PurchaseOrderReceiptItem.product_id == Product.id
    ).filter(
        PurchaseOrderReceiptItem.receipt_id == receipt.id
    )
    
    for item in receipt_items_query.all():
        result["items"].append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity_received": item.quantity_received,
            "quantity_rejected": item.quantity_rejected,
            "rejection_reason": item.rejection_reason
        })
    
    return result

@router.get("/{order_id}/receipts", response_model=List[Receipt])
async def get_order_receipts(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener el historial de recepciones de una orden de compra.
    """
    # Verificar que la orden existe
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden de compra no encontrada"
        )
    
    # Obtener todas las recepciones para esta orden
    receipts_query = db.query(PurchaseOrderReceipt).filter(
        PurchaseOrderReceipt.purchase_order_id == order_id
    ).order_by(PurchaseOrderReceipt.receipt_date.desc())
    
    receipts = receipts_query.all()
    
    # Preparar respuesta
    result = []
    for receipt in receipts:
        receipt_data = {
            "id": receipt.id,
            "purchase_order_id": receipt.purchase_order_id,
            "receipt_date": receipt.receipt_date,
            "received_by": receipt.received_by,
            "status": receipt.status,
            "notes": receipt.notes,
            "items": []
        }
        
        # Obtener items de la recepción
        receipt_items_query = db.query(
            PurchaseOrderReceiptItem.id,
            PurchaseOrderReceiptItem.product_id,
            Product.name.label("product_name"),
            PurchaseOrderReceiptItem.quantity_received,
            PurchaseOrderReceiptItem.quantity_rejected,
            PurchaseOrderReceiptItem.rejection_reason
        ).join(
            Product, PurchaseOrderReceiptItem.product_id == Product.id
        ).filter(
            PurchaseOrderReceiptItem.receipt_id == receipt.id
        )
        
        for item in receipt_items_query.all():
            receipt_data["items"].append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity_received": item.quantity_received,
                "quantity_rejected": item.quantity_rejected,
                "rejection_reason": item.rejection_reason
            })
        
        result.append(receipt_data)
    
    return result

@router.get("/supplier/{supplier_id}/history", response_model=List[PurchaseOrderSchema])
async def get_supplier_purchase_history(
    supplier_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener el historial de órdenes de compra para un proveedor específico.
    """
    # Verificar que el proveedor existe
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proveedor no encontrado"
        )
    
    # Obtener las órdenes más recientes para este proveedor
    orders_query = db.query(PurchaseOrder).filter(
        PurchaseOrder.supplier_id == supplier_id
    ).order_by(PurchaseOrder.order_date.desc()).limit(limit)
    
    orders = orders_query.all()
    
    # Preparar respuesta
    result = []
    for order in orders:
        order_data = {
            "id": order.id,
            "order_number": order.order_number,
            "supplier_id": order.supplier_id,
            "supplier_name": supplier.name,
            "order_date": order.order_date,
            "expected_delivery_date": order.expected_delivery_date,
            "status": order.status,
            "total_amount": order.total_amount,
            "payment_terms": order.payment_terms,
            "shipping_method": order.shipping_method,
            "notes": order.notes,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "items": []
        }
        
        # Obtener items de la orden
        items_query = db.query(
            purchase_order_items.c.id,
            purchase_order_items.c.product_id,
            Product.name.label("product_name"),
            purchase_order_items.c.quantity,
            purchase_order_items.c.unit_price,
            purchase_order_items.c.subtotal,
            purchase_order_items.c.notes
        ).join(
            Product, purchase_order_items.c.product_id == Product.id
        ).filter(
            purchase_order_items.c.purchase_order_id == order.id
        )
        
        for item in items_query.all():
            order_data["items"].append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
                "notes": item.notes
            })
        
        result.append(order_data)
    
    return result

@router.post("/{order_id}/approve", response_model=PurchaseOrderSchema)
async def approve_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aprobar una orden de compra pendiente.
    """
    # Verificar que el usuario tiene permisos para aprobar (opcional)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para aprobar órdenes de compra"
        )
    
    # Buscar la orden
    db_order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    
    # Verificar si existe
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden de compra no encontrada"
        )
    
    # Solo permitir aprobar órdenes pendientes
    if db_order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede aprobar una orden con estado '{db_order.status}'"
        )
    
    # Actualizar el estado de la orden
    db_order.status = "approved"
    db.commit()
    db.refresh(db_order)
    
    # Preparar respuesta
    result = {
        "id": db_order.id,
        "order_number": db_order.order_number,
        "supplier_id": db_order.supplier_id,
        "supplier_name": db_order.supplier.name if db_order.supplier else None,
        "order_date": db_order.order_date,
        "expected_delivery_date": db_order.expected_delivery_date,
        "status": db_order.status,
        "total_amount": db_order.total_amount,
        "payment_terms": db_order.payment_terms,
        "shipping_method": db_order.shipping_method,
        "notes": db_order.notes,
        "created_at": db_order.created_at,
        "updated_at": db_order.updated_at,
        "items": []
    }
    
    # Obtener items de la orden
    items_query = db.query(
        purchase_order_items.c.id,
        purchase_order_items.c.product_id,
        Product.name.label("product_name"),
        purchase_order_items.c.quantity,
        purchase_order_items.c.unit_price,
        purchase_order_items.c.subtotal,
        purchase_order_items.c.notes
    ).join(
        Product, purchase_order_items.c.product_id == Product.id
    ).filter(
        purchase_order_items.c.purchase_order_id == db_order.id
    )
    
    items = items_query.all()
    for item in items:
        result["items"].append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
            "notes": item.notes
        })
    
    return result

@router.post("/{order_id}/cancel", response_model=PurchaseOrderSchema)
async def cancel_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancelar una orden de compra.
    """
    # Verificar que el usuario tiene permisos para cancelar (opcional)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para cancelar órdenes de compra"
        )
    
    # Buscar la orden
    db_order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    
    # Verificar si existe
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden de compra no encontrada"
        )
    
    # Solo permitir cancelar órdenes pendientes o aprobadas
    if db_order.status not in ["pending", "approved"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar una orden con estado '{db_order.status}'"
        )
    
    # Actualizar el estado de la orden
    db_order.status = "cancelled"
    db.commit()
    db.refresh(db_order)
    
    # Preparar respuesta
    result = {
        "id": db_order.id,
        "order_number": db_order.order_number,
        "supplier_id": db_order.supplier_id,
        "supplier_name": db_order.supplier.name if db_order.supplier else None,
        "order_date": db_order.order_date,
        "expected_delivery_date": db_order.expected_delivery_date,
        "status": db_order.status,
        "total_amount": db_order.total_amount,
        "payment_terms": db_order.payment_terms,
        "shipping_method": db_order.shipping_method,
        "notes": db_order.notes,
        "created_at": db_order.created_at,
        "updated_at": db_order.updated_at,
        "items": []
    }
    
    # Obtener items de la orden
    items_query = db.query(
        purchase_order_items.c.id,
        purchase_order_items.c.product_id,
        Product.name.label("product_name"),
        purchase_order_items.c.quantity,
        purchase_order_items.c.unit_price,
        purchase_order_items.c.subtotal,
        purchase_order_items.c.notes
    ).join(
        Product, purchase_order_items.c.product_id == Product.id
    ).filter(
        purchase_order_items.c.purchase_order_id == db_order.id
    )
    
    items = items_query.all()
    for item in items:
        result["items"].append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
            "notes": item.notes
        })
    
    return result