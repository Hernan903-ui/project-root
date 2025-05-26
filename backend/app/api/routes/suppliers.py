from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session

# Importaciones correctas para tus dependencias
from app.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse

# Crear el router con prefijo específico y tag para documentación
router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
    responses={404: {"description": "Proveedor no encontrado"}}
)

@router.get("/", response_model=dict)
async def get_suppliers(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    name: Optional[str] = Query(None, description="Filtrar por nombre"),
    status: Optional[str] = Query(None, description="Filtrar por estado (active/inactive)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de proveedores con paginación y filtros opcionales.
    """
    try:
        # Calcular el offset basado en la página y el límite
        skip = (page - 1) * limit
        
        # Construir la consulta base
        query = db.query(Supplier)
        
        # Aplicar filtros si se proporcionaron
        if name:
            query = query.filter(Supplier.name.ilike(f"%{name}%"))
        if status:
            query = query.filter(Supplier.status == status)
        
        # Obtener el total de registros para la paginación
        total = query.count()
        
        # Aplicar paginación
        suppliers = query.offset(skip).limit(limit).all()
        
        # Calcular total de páginas
        pages = (total + limit - 1) // limit if total > 0 else 1
        
        return {
            "items": suppliers,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages
        }
    except Exception as e:
        # Logging del error
        print(f"Error al obtener proveedores: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener proveedores: {str(e)}"
        )

# Ruta de búsqueda por nombre
@router.get("/search/name/{name}", response_model=List[SupplierResponse])
async def search_suppliers_by_name(
    name: str,
    limit: int = Query(10, ge=1, le=50, description="Número máximo de resultados"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Buscar proveedores por nombre.
    
    Requiere autenticación. Útil para implementar búsqueda en tiempo real.
    """
    try:
        suppliers = db.query(Supplier).filter(
            Supplier.name.ilike(f"%{name}%")
        ).limit(limit).all()
        
        return suppliers
    except Exception as e:
        print(f"Error al buscar proveedores por nombre: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar proveedores: {str(e)}"
        )

@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear un nuevo proveedor.
    
    Requiere autenticación y proporciona todos los campos obligatorios para el proveedor.
    """
    try:
        # Verificar si ya existe un proveedor con el mismo nombre
        existing_supplier = db.query(Supplier).filter(Supplier.name == supplier.name).first()
        if existing_supplier:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un proveedor con el nombre '{supplier.name}'"
            )
        
        # Crear nueva instancia del modelo Supplier con los datos del request
        db_supplier = Supplier(**supplier.dict())
        
        # Añadir a la sesión de BD y confirmar
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        
        return db_supplier
    except HTTPException:
        # Re-lanzar excepciones HTTP ya formateadas
        raise
    except Exception as e:
        db.rollback()  # Revertir transacción en caso de error
        print(f"Error al crear proveedor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear proveedor: {str(e)}"
        )

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener un proveedor por su ID.
    
    Requiere autenticación.
    """
    try:
        # Buscar el proveedor en la BD
        db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        
        # Verificar si existe
        if db_supplier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Proveedor con ID {supplier_id} no encontrado"
            )
        
        return db_supplier
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener proveedor {supplier_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener proveedor: {str(e)}"
        )

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: int,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar un proveedor existente.
    
    Requiere autenticación. Solo se actualizarán los campos proporcionados.
    """
    try:
        # Buscar el proveedor en la BD
        db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        
        # Verificar si existe
        if db_supplier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Proveedor con ID {supplier_id} no encontrado"
            )
        
        # Verificar si ya existe otro proveedor con el mismo nombre (si se está cambiando el nombre)
        if supplier.name and supplier.name != db_supplier.name:
            existing_supplier = db.query(Supplier).filter(
                Supplier.name == supplier.name,
                Supplier.id != supplier_id
            ).first()
            if existing_supplier:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Ya existe otro proveedor con el nombre '{supplier.name}'"
                )
        
        # Actualizar solo los campos que vienen en la solicitud
        supplier_data = supplier.dict(exclude_unset=True)
        for key, value in supplier_data.items():
            setattr(db_supplier, key, value)
        
        # Confirmar cambios
        db.commit()
        db.refresh(db_supplier)
        
        return db_supplier
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Revertir transacción en caso de error
        print(f"Error al actualizar proveedor {supplier_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar proveedor: {str(e)}"
        )

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    response: Response = None
):
    """
    Eliminar un proveedor.
    
    Requiere autenticación. Retorna código 204 (Sin contenido) si tiene éxito.
    """
    try:
        # Buscar el proveedor en la BD
        db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        
        # Verificar si existe
        if db_supplier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Proveedor con ID {supplier_id} no encontrado"
            )
        
        # Verificar si tiene órdenes de compra asociadas (opcional, depende de tus modelos)
        # if db_supplier.purchase_orders:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="No se puede eliminar el proveedor porque tiene órdenes de compra asociadas"
        #     )
        
        # Eliminar y confirmar
        db.delete(db_supplier)
        db.commit()
        
        response.status_code = status.HTTP_204_NO_CONTENT
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Revertir transacción en caso de error
        print(f"Error al eliminar proveedor {supplier_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar proveedor: {str(e)}"
        )

@router.patch("/{supplier_id}/status", response_model=SupplierResponse)
async def update_supplier_status(
    supplier_id: int,
    status_value: str = Query(..., alias="status", description="Nuevo estado (active/inactive)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar solo el estado de un proveedor.
    
    Requiere autenticación. Permite cambiar rápidamente el estado sin actualizar otros campos.
    """
    try:
        # Validar el valor del estado
        if status_value not in ["active", "inactive"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estado debe ser 'active' o 'inactive'"
            )
        
        # Buscar el proveedor en la BD
        db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        
        # Verificar si existe
        if db_supplier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Proveedor con ID {supplier_id} no encontrado"
            )
        
        # Actualizar estado
        db_supplier.status = status_value
        db.commit()
        db.refresh(db_supplier)
        
        return db_supplier
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Revertir transacción en caso de error
        print(f"Error al actualizar estado de proveedor {supplier_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar estado: {str(e)}"
        )