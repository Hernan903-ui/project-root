# app/api/routes/uploads.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Any, List
import os
import uuid
import shutil
from ...database import get_db
from ...config import settings
from .auth import get_current_active_user
from ...models.product import Product

router = APIRouter()

@router.post("/product-image/{product_id}")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Subir una imagen para un producto.
    """
    # Verificar que el producto existe
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verificar tipo de archivo
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Crear directorio si no existe
    upload_dir = os.path.join(settings.UPLOADS_FOLDER, "products")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generar nombre de archivo único
    file_extension = os.path.splitext(file.filename)[1]
    new_filename = f"{product_id}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, new_filename)
    
    # Guardar archivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Actualizar referencia en la base de datos (asumiendo que agregamos un campo 'image_path')
    # Primero tendríamos que modificar el modelo Product para incluir este campo
    # product.image_path = new_filename
    # db.add(product)
    # db.commit()
    
    return {"filename": new_filename}

@router.get("/product-image/{filename}")
async def get_product_image(
    filename: str,
) -> Any:
    """
    Obtener una imagen de producto por su nombre de archivo.
    """
    file_path = os.path.join(settings.UPLOADS_FOLDER, "products", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)