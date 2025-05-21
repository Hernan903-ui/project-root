from pydantic import BaseModel, Field, constr
from typing import Optional, Annotated # Added Annotated
from datetime import datetime

class CategoryBase(BaseModel):
    name: Annotated[str, constr(min_length=1, max_length=50)]
    description: Annotated[Optional[str], constr(max_length=255)] = None # Default still here

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Annotated[Optional[str], constr(min_length=1, max_length=50)] = None
    description: Annotated[Optional[str], constr(max_length=255)] = None

class CategoryInDBBase(CategoryBase):
    id: Annotated[int, Field(gt=0)] # Field still used for gt, ge etc.
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Category(CategoryInDBBase):
    pass