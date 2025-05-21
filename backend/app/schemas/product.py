from pydantic import BaseModel, Field, validator
from typing import Optional, List, Annotated
from datetime import datetime

# Forward declaration for Category to avoid circular import issues
class Category(BaseModel): 
    id: int
    name: str
    
    class Config:
        from_attributes = True  # orm_mode está obsoleto en Pydantic v2

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
    
    # Validaciones usando validators en lugar de constr y Field
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v) > 50:
            raise ValueError('name must be 1-50 characters')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        if v and len(v) > 250:
            raise ValueError('description must be at most 250 characters')
        return v
    
    @validator('sku')
    def validate_sku(cls, v):
        if not v or len(v) > 250:
            raise ValueError('sku must be 1-250 characters')
        return v
    
    @validator('barcode')
    def validate_barcode(cls, v):
        if v and len(v) > 50:
            raise ValueError('barcode must be at most 50 characters')
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('price must be greater than 0')
        return v
    
    @validator('cost_price')
    def validate_cost_price(cls, v):
        if v < 0:
            raise ValueError('cost_price must be non-negative')
        return v
    
    @validator('tax_rate')
    def validate_tax_rate(cls, v):
        if v < 0 or v > 1:
            raise ValueError('tax_rate must be between 0 and 1')
        return v
    
    @validator('category_id')
    def validate_category_id(cls, v):
        if v <= 0:
            raise ValueError('category_id must be positive')
        return v
    
    @validator('stock_quantity', 'min_stock_level')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError('stock values must be non-negative')
        return v

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
    
    # Podríamos agregar validadores similares aquí si se necesitan 
    # para validar campos opcionales cuando están presentes

class ProductInDBBase(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Reemplaza orm_mode en Pydantic v2

class Product(ProductInDBBase):
    pass

class ProductWithCategory(Product):
    category: Category