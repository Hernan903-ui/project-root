from fastapi import APIRouter

from .routes import auth, categories, products, sales, inventory, customers, reports

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])