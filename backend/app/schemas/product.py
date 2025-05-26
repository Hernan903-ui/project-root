from pydantic import BaseModel, Field, constr
from typing import Optional, List, Annotated # Added Annotated
from datetime import datetime

# Forward declaration for Category to avoid circular import issues
# if Category schema also imports Product.
class Category(BaseModel):
    id: int
    name: str
    # Add other fields if they are accessed directly when ProductWithCategory is serialized
    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: Annotated[str, constr(min_length=1, max_length=50)]
    description: Annotated[Optional[str], constr(max_length=250)] = None
    sku: Annotated[str, constr(min_length=1, max_length=250)]
    barcode: Annotated[Optional[str], constr(max_length=50)] = None # Assuming barcode can be optional
    price: Annotated[float, Field(gt=0)] # Price must be greater than 0
    cost_price: Annotated[float, Field(ge=0)] # Cost price can be 0 or more
    tax_rate: Annotated[float, Field(default=0.0, ge=0, le=1)] = 0.0 # Tax rate between 0 and 1 (0% to 100%)
    category_id: Annotated[int, Field(gt=0)] # Category ID must be a positive integer
    stock_quantity: Annotated[int, Field(default=0, ge=0)] = 0 # Stock quantity can be 0 or more
    min_stock_level: Annotated[int, Field(default=0, ge=0)] = 0 # Min stock level can be 0 or more
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Annotated[Optional[str], constr(min_length=1, max_length=50)] = None
    description: Annotated[Optional[str], constr(max_length=250)] = None
    sku: Annotated[Optional[str], constr(min_length=1, max_length=250)] = None
    barcode: Annotated[Optional[str], constr(max_length=50)] = None
    price: Annotated[Optional[float], Field(gt=0)] = None
    cost_price: Annotated[Optional[float], Field(ge=0)] = None
    tax_rate: Annotated[Optional[float], Field(ge=0, le=1)] = None
    category_id: Annotated[Optional[int], Field(gt=0)] = None
    stock_quantity: Annotated[Optional[int], Field(ge=0)] = None
    min_stock_level: Annotated[Optional[int], Field(ge=0)] = None
    is_active: Optional[bool] = None

class ProductInDBBase(ProductBase):
    id: Annotated[int, Field(gt=0)] # ID must be positive
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Product(ProductInDBBase):
    pass

class ProductWithCategory(Product):
    # Ensure 'Category' matches the class name of your category schema/stub
    category: 'Category'