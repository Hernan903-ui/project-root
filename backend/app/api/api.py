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
    purchase_orders,
    suppliers,
    users
)

api_router = APIRouter()

# Incluir todos los routers con sus prefijos correspondientes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(backups.router, prefix="/backups", tags=["backups"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(purchase_orders.router, prefix="/purchase-orders", tags=["purchase-orders"])