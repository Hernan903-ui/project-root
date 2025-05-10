from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.product import Product
from ...schemas.product import ProductCreate, ProductUpdate, Product as ProductSchema, ProductWithCategory
from ...api.routes.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[ProductWithCategory])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve products.
    """
    query = db.query(Product)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%") | 
            Product.description.ilike(f"%{search}%") |
            Product.sku.ilike(f"%{search}%") |
            Product.barcode.ilike(f"%{search}%")
        )
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.post("/", response_model=ProductSchema)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: ProductCreate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Create new product.
    """
    # Verificar si ya existe un producto con el mismo SKU o código de barras
    existing_sku = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing_sku:
        raise HTTPException(
            status_code=400,
            detail="A product with this SKU already exists.",
        )
    
    if product_in.barcode:
        existing_barcode = db.query(Product).filter(Product.barcode == product_in.barcode).first()
        if existing_barcode:
            raise HTTPException(
                status_code=400,
                detail="A product with this barcode already exists.",
            )
    
    product = Product(**product_in.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{id}", response_model=ProductSchema)
def update_product(
    *,
    db: Session = Depends(get_db),
    id: int,
    product_in: ProductUpdate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Update a product.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verificar si se está actualizando el SKU y ya existe otro producto con ese SKU
    if product_in.sku and product_in.sku != product.sku:
        existing_sku = db.query(Product).filter(Product.sku == product_in.sku).first()
        if existing_sku:
            raise HTTPException(
                status_code=400,
                detail="A product with this SKU already exists.",
            )
    
    # Verificar lo mismo para el código de barras
    if product_in.barcode and product_in.barcode != product.barcode:
        existing_barcode = db.query(Product).filter(Product.barcode == product_in.barcode).first()
        if existing_barcode:
            raise HTTPException(
                status_code=400,
                detail="A product with this barcode already exists.",
            )
    
    update_data = product_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/{id}", response_model=ProductWithCategory)
def read_product(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Get product by ID.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{id}", response_model=ProductSchema)
def delete_product(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Delete a product.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # En lugar de eliminar el producto, lo marcamos como inactivo
    # Esto es para mantener la integridad referencial con las ventas históricas
    product.is_active = False
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/low-stock/", response_model=List[ProductWithCategory])
def read_low_stock_products(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve products with stock below min_stock_level.
    """
    products = db.query(Product).filter(
        Product.stock_quantity <= Product.min_stock_level,
        Product.is_active == True
    ).all()
    return products