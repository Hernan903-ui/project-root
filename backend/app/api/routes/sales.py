from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from ...database import get_db
from ...models.sale import Sale, SaleItem
from ...models.product import Product
from ...models.inventory import InventoryMovement
from ...schemas.sale import (
    SaleCreate, 
    SaleUpdate, 
    Sale as SaleSchema,
    SaleWithItems,
    SaleWithItemsAndProducts
)
from ...api.routes.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=SaleWithItems, status_code=status.HTTP_201_CREATED)
def create_sale(
    *,
    db: Session = Depends(get_db),
    sale_in: SaleCreate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Create new sale with items.
    """
    # Verificar si el invoice_number ya existe
    existing_invoice = db.query(Sale).filter(Sale.invoice_number == sale_in.invoice_number).first()
    if existing_invoice:
        raise HTTPException(
            status_code=400,
            detail="A sale with this invoice number already exists.",
        )
    
    # Crear la venta principal
    sale = Sale(
        invoice_number=sale_in.invoice_number,
        customer_id=sale_in.customer_id,
        total_amount=sale_in.total_amount,
        tax_amount=sale_in.tax_amount,
        discount_amount=sale_in.discount_amount,
        payment_method=sale_in.payment_method,
        payment_status=sale_in.payment_status,
        notes=sale_in.notes,
        created_by=current_user.id
    )
    db.add(sale)
    db.flush()  # Para obtener el ID de la venta sin hacer commit completo
    
    # Crear los items y actualizar el inventario
    for item_data in sale_in.items:
        # Verificar que el producto existe
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product with id {item_data.product_id} not found")
        
        # Verificar stock disponible
        if product.stock_quantity < item_data.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for product {product.name}. Available: {product.stock_quantity}, requested: {item_data.quantity}"
            )
        
        # Crear el item de venta
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount=item_data.discount,
            tax_rate=item_data.tax_rate,
            total=item_data.total
        )
        db.add(sale_item)
        
        # Actualizar el inventario (reducir stock)
        product.stock_quantity -= item_data.quantity
        db.add(product)
        
        # Registrar el movimiento de inventario
        inventory_movement = InventoryMovement(
            product_id=item_data.product_id,
            movement_type="sale",
            quantity=-item_data.quantity,  # Negativo porque es una salida
            reference_id=sale.id,
            notes=f"Sale: {sale.invoice_number}",
            created_by=current_user.id
        )
        db.add(inventory_movement)
    
    db.commit()
    db.refresh(sale)
    
    # Recuperar la venta con todos sus items
    sale_with_items = db.query(Sale).filter(Sale.id == sale.id).first()
    return sale_with_items

@router.get("/", response_model=List[SaleWithItems])
def read_sales(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    customer_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    payment_method: Optional[str] = None,
    date_from: Optional[datetime.date] = None,
    date_to: Optional[datetime.date] = None,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve sales.
    """
    query = db.query(Sale)
    
    if customer_id:
        query = query.filter(Sale.customer_id == customer_id)
    
    if payment_status:
        query = query.filter(Sale.payment_status == payment_status)
    
    if payment_method:
        query = query.filter(Sale.payment_method == payment_method)
    
    if date_from:
        query = query.filter(Sale.created_at >= datetime.datetime.combine(date_from, datetime.time.min))
    
    if date_to:
        query = query.filter(Sale.created_at <= datetime.datetime.combine(date_to, datetime.time.max))
    
    sales = query.order_by(Sale.created_at.desc()).offset(skip).limit(limit).all()
    return sales

@router.get("/{id}", response_model=SaleWithItemsAndProducts)
def read_sale(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Get sale by ID including all items and products.
    """
    sale = db.query(Sale).filter(Sale.id == id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.put("/{id}", response_model=SaleWithItems)
def update_sale(
    *,
    db: Session = Depends(get_db),
    id: int,
    sale_in: SaleUpdate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Update a sale (only certain fields, not items).
    """
    sale = db.query(Sale).filter(Sale.id == id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Solo permitimos actualizar ciertos campos de la venta, no los items
    update_data = sale_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sale, field, value)
    
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

@router.delete("/{id}", response_model=SaleSchema)
def cancel_sale(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Cancel a sale and restore inventory.
    """
    sale = db.query(Sale).filter(Sale.id == id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Solo se pueden cancelar ventas que no estén ya canceladas
    if sale.payment_status == "cancelled":
        raise HTTPException(status_code=400, detail="This sale is already cancelled")
    
    # Marcar la venta como cancelada
    sale.payment_status = "cancelled"
    db.add(sale)
    
    # Recuperar los items de la venta
    sale_items = db.query(SaleItem).filter(SaleItem.sale_id == id).all()
    
    # Para cada item, restaurar el inventario
    for item in sale_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            # Sumar el producto de vuelta al inventario
            product.stock_quantity += item.quantity
            db.add(product)
            
            # Registrar el movimiento de inventario (devolución)
            inventory_movement = InventoryMovement(
                product_id=item.product_id,
                movement_type="return",
                quantity=item.quantity,  # Positivo porque es una entrada
                reference_id=sale.id,
                notes=f"Sale Cancellation: {sale.invoice_number}",
                created_by=current_user.id
            )
            db.add(inventory_movement)
    
    db.commit()
    db.refresh(sale)
    return sale

@router.get("/report/daily/", response_model=List[dict])
def get_daily_sales_report(
    db: Session = Depends(get_db),
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Get daily sales report.
    """
    from sqlalchemy import func
    
    if not start_date:
        start_date = datetime.date.today() - datetime.timedelta(days=30)
    
    if not end_date:
        end_date = datetime.date.today()
    
    # Consulta para agrupar ventas por día
    query = db.query(
        func.date(Sale.created_at).label('date'),
        func.count(Sale.id).label('total_sales'),
        func.sum(Sale.total_amount).label('total_amount')
    ).filter(
        func.date(Sale.created_at) >= start_date,
        func.date(Sale.created_at) <= end_date,
        Sale.payment_status != 'cancelled'
    ).group_by(
        func.date(Sale.created_at)
    ).order_by(
        func.date(Sale.created_at)
    )
    
    result = query.all()
    
    # Convertir el resultado a diccionarios
    report = [
        {
            "date": str(row.date),
            "total_sales": row.total_sales,
            "total_amount": float(row.total_amount) if row.total_amount else 0.0
        }
        for row in result
    ]
    
    return report

@router.get("/report/products/", response_model=List[dict])
def get_top_selling_products(
    db: Session = Depends(get_db),
    limit: int = 10,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Get top selling products report.
    """
    from sqlalchemy import func
    
    if not start_date:
        start_date = datetime.date.today() - datetime.timedelta(days=30)
    
    if not end_date:
        end_date = datetime.date.today()
    
    # Consulta para obtener los productos más vendidos
    query = db.query(
        Product.id,
        Product.name,
        func.sum(SaleItem.quantity).label('total_quantity'),
        func.sum(SaleItem.total).label('total_revenue')
    ).join(
        SaleItem, SaleItem.product_id == Product.id
    ).join(
        Sale, Sale.id == SaleItem.sale_id
    ).filter(
        func.date(Sale.created_at) >= start_date,
        func.date(Sale.created_at) <= end_date,
        Sale.payment_status != 'cancelled'
    ).group_by(
        Product.id
    ).order_by(
        func.sum(SaleItem.quantity).desc()
    ).limit(limit)
    
    result = query.all()
    
    # Convertir el resultado a diccionarios
    report = [
        {
            "product_id": row.id,
            "product_name": row.name,
            "total_quantity": row.total_quantity,
            "total_revenue": float(row.total_revenue)
        }
        for row in result
    ]
    
    return report