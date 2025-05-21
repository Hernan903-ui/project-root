# app/api/api.py
from fastapi import APIRouter

from app.api.routes import (
    auth,
    backups,
    categories,
    customers,
    inventory,
    products,
    reports,
    sales,
    uploads,
    # Importa el nuevo router de usuarios
    users # <--- ¡Importar aquí!
)

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(backups.router, tags=["backups"])
api_router.include_router(categories.router, tags=["categories"])
api_router.include_router(customers.router, tags=["customers"])
api_router.include_router(inventory.router, tags=["inventory"])
api_router.include_router(products.router, tags=["products"])
api_router.include_router(reports.router, tags=["reports"])
api_router.include_router(sales.router, tags=["sales"])
api_router.include_router(uploads.router, tags=["uploads"])
# Incluye el nuevo router de usuarios
api_router.include_router(users.router, tags=["users"]) # <--- ¡Incluir aquí!
