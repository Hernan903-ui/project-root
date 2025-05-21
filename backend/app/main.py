import os
from fastapi import HTTPException
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.api import api_router
from app.initialization import init_db
from app.middleware.logging import logging_middleware
from app.middleware.rate_limiter import rate_limiting_middleware
from app.config import settings
from app.scheduled_tasks import start_scheduler
from app.api.routes import users

# Actualiza la definición de app en main.py
app = FastAPI(
    title="POS & Inventory API",
    description="API para un sistema de punto de venta e inventario",
    version="1.0.0",
    openapi_tags=[
        {"name": "authentication", "description": "Operaciones de autenticación"},
        {"name": "products", "description": "Gestión de productos"},
        {"name": "categories", "description": "Gestión de categorías"},
        {"name": "sales", "description": "Operaciones de ventas"},
        {"name": "inventory", "description": "Gestión de inventario"},
        {"name": "customers", "description": "Gestión de clientes"},
        {"name": "reports", "description": "Generación de reportes"},
        {"name": "administration", "description": "Funciones administrativas"},
    ],
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Ajusta según tu entorno
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Añadir middleware personalizado
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        return await logging_middleware(request, call_next)

class RateLimitingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        return await rate_limiting_middleware(request, call_next)

app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitingMiddleware)

# Incluir todos los routers bajo el prefijo /api
app.include_router(api_router, prefix="/api")


# ÚNICO evento de startup (eliminado el duplicado)
@app.on_event("startup")
async def startup_event():
    """
    Inicializa componentes al iniciar la aplicación.
    """
    init_db()
    
    # Iniciar tareas programadas en entornos de producción
    if settings.ENVIRONMENT == "production":
        start_scheduler()

@app.get("/")
async def root():
    return {"message": "POS & Inventory API"}

@app.post("/api/seed-database", tags=["administration"])
async def seed_db(request: Request):
    """
    Puebla la base de datos con datos de ejemplo.
    Solo disponible en entorno de desarrollo.
    """
    # Verificar si estamos en modo desarrollo
    if os.getenv("ENVIRONMENT", "development") != "development":
        raise HTTPException(
            status_code=403,
            detail="Este endpoint solo está disponible en entorno de desarrollo"
        )
    
    # Verificar la IP del cliente (solo permitir localhost)
    client_host = request.client.host
    if client_host not in ["127.0.0.1", "localhost", "::1"]:
        raise HTTPException(
            status_code=403,
            detail="Este endpoint solo está disponible desde localhost"
        )
    
    from app.data_seed import seed_database
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        seed_database(db)
        return {"message": "Base de datos poblada con éxito"}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)