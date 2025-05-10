from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.inventory import InventoryMovement
from ...models.product import Product
from ...schemas.inventory import (
    InventoryMovementCreate,
    InventoryMovement as InventoryMovementSchema,
    InventoryMovementWithProduct
)
from ...api.routes.auth import get_current_active_user, get_current_user

router = APIRouter()

@router.post("/", response_model=InventoryMovementSchema)
def create_inventory_movement(
    *,
    db: Session = Depends(get_db),
    movement_in: InventoryMovementCreate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Create new inventory movement and update product stock.
    """
    # Verificar que el producto existe
    product = db.query(Product).filter(Product.id == movement_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Crear el movimiento de inventario
    movement = InventoryMovement(
        **movement_in.dict(),
        created_by=current_user.id
    )
    db.add(movement)
    
    # Actualizar el stock del producto
    product.stock_quantity += movement_in.quantity
    db.add(product)
    
    db.commit()
    db.refresh(movement)
    return movement

@router.get("/", response_model=List[InventoryMovementWithProduct])
def read_inventory_movements(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    product_id: int = None,
    movement_type: str = None,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve inventory movements.
    """
    query = db.query(InventoryMovement)
    
    if product_id:
        query = query.filter(InventoryMovement.product_id == product_id)
    
    if movement_type:
        query = query.filter(InventoryMovement.movement_type == movement_type)
    
    movements = query.order_by(InventoryMovement.created_at.desc()).offset(skip).limit(limit).all()
    return movements

@router.get("/{id}", response_model=InventoryMovementWithProduct)
def read_inventory_movement(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Get a specific inventory movement.
    """
    movement = db.query(InventoryMovement).filter(InventoryMovement.id == id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Inventory movement not found")
    return movement