from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class MovementTypeEnum(str, Enum):
    PURCHASE = "purchase"
    SALE = "sale"
    ADJUSTMENT = "adjustment"
    RETURN = "return"
    INITIAL = "initial"

class InventoryMovementBase(BaseModel):
    product_id: int
    movement_type: MovementTypeEnum
    quantity: int
    reference_id: Optional[int] = None
    notes: Optional[str] = None

class InventoryMovementCreate(InventoryMovementBase):
    pass

class InventoryMovementUpdate(BaseModel):
    quantity: Optional[int] = None
    notes: Optional[str] = None

class InventoryMovementInDBBase(InventoryMovementBase):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        orm_mode = True

class InventoryMovement(InventoryMovementInDBBase):
    pass

class InventoryMovementWithProduct(InventoryMovement):
    product: "Product"

from .product import Product