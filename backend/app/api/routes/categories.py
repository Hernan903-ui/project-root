from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.category import Category
from ...schemas.category import CategoryCreate, CategoryUpdate, Category as CategorySchema
from ...api.routes.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[CategorySchema])
def read_categories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve categories.
    """
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=CategorySchema)
def create_category(
    *,
    db: Session = Depends(get_db),
    category_in: CategoryCreate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Create new category.
    """
    category = Category(
        name=category_in.name,
        description=category_in.description,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{id}", response_model=CategorySchema)
def update_category(
    *,
    db: Session = Depends(get_db),
    id: int,
    category_in: CategoryUpdate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Update a category.
    """
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/{id}", response_model=CategorySchema)
def read_category(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Get category by ID.
    """
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.delete("/{id}", response_model=CategorySchema)
def delete_category(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Delete a category.
    """
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return category