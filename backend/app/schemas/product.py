from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    price: float
    cost_price: float
    tax_rate: float = 0.0
    category_id: int
    stock_quantity: int = 0
    min_stock_level: int = 0
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    tax_rate: Optional[float] = None
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    is_active: Optional[bool] = None

class ProductInDBBase(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Product(ProductInDBBase):
    pass

class ProductWithCategory(Product):
    category: Category

from .category import Category