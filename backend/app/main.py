#app/main.py
import os
import logging
import datetime
from fastapi import HTTPException, FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.api import api_router
from app.initialization import init_db
from app.middleware.logging import logging_middleware
from app.middleware.rate_limiter import rate_limiting_middleware
from app.config import settings
from app.scheduled_tasks import start_scheduler
from app.api.routes import users

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("app")

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
        {"name": "suppliers", "description": "Gestión de proveedores"},
        {"name": "purchase-orders", "description": "Gestión de órdenes de compra"},
        {"name": "health", "description": "Verificación de estado del sistema"},
    ],
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configurar CORS - Expandido para desarrollo
origins = [
    "http://localhost:3000",     # React default
    "http://127.0.0.1:3000",     # Alternative localhost
    "http://localhost:5173",     # Vite default
    "http://127.0.0.1:5173",     # Alternative Vite
    "http://localhost:8080",     # Webpack default
]

# En producción, añadir dominios específicos
if settings.ENVIRONMENT == "production":
    origins.extend([
        "https://yourdomain.com",
        "https://app.yourdomain.com",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "Content-Disposition"],
)

# Añadir middleware personalizado
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"Incoming request: {request.method} {request.url.path}")
        return await logging_middleware(request, call_next)

class RateLimitingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        return await rate_limiting_middleware(request, call_next)

app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitingMiddleware)

# Manejador global de excepciones
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error no controlado: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "path": request.url.path},
    )

# Incluir todos los routers bajo el prefijo /api
app.include_router(api_router, prefix="/api")

# ÚNICO evento de startup
@app.on_event("startup")
async def startup_event():
    """
    Inicializa componentes al iniciar la aplicación.
    """
    logger.info("Iniciando aplicación...")
    try:
        logger.info("Inicializando base de datos...")
        init_db()
        logger.info("Base de datos inicializada correctamente")
        
        # Iniciar tareas programadas en entornos de producción
        if settings.ENVIRONMENT == "production":
            logger.info("Iniciando tareas programadas...")
            start_scheduler()
            logger.info("Tareas programadas iniciadas correctamente")
    except Exception as e:
        logger.error(f"Error durante la inicialización: {str(e)}", exc_info=True)
        # No re-lanzamos la excepción para permitir que la app inicie de todos modos
    
    logger.info(f"Aplicación iniciada en modo: {settings.ENVIRONMENT}")
    logger.info(f"CORS configurado para orígenes: {origins}")

@app.get("/")
async def root():
    logger.info("Acceso a la ruta raíz")
    return {"message": "POS & Inventory API"}

# NUEVO: Endpoint de health check para verificación de conexión
@app.get("/health", tags=["health"])
async def health_check():
    """
    Endpoint para verificar que la API está funcionando correctamente.
    Utilizado por el frontend para verificar la conexión.
    """
    logger.info("Health check solicitado")
    return {
        "status": "ok",
        "timestamp": datetime.datetime.now().isoformat(),
        "environment": settings.ENVIRONMENT,
        "api_version": "1.0.0"
    }

# NUEVO: Endpoint para verificar el estado de CORS
@app.options("/cors-test", tags=["health"])
async def cors_preflight_check():
    """
    Endpoint para verificar que CORS está configurado correctamente.
    """
    logger.info("Verificación de preflight CORS")
    return {}

@app.get("/cors-test", tags=["health"])
async def cors_check():
    """
    Endpoint para verificar que CORS está configurado correctamente.
    """
    logger.info("Verificación de CORS")
    return {"cors_test": "success"}

@app.post("/api/seed-database", tags=["administration"])
async def seed_db(request: Request):
    """
    Puebla la base de datos con datos de ejemplo.
    Solo disponible en entorno de desarrollo.
    """
    logger.info("Solicitud para poblar la base de datos")
    
    # Verificar si estamos en modo desarrollo
    if settings.ENVIRONMENT != "development":
        logger.warning(f"Intento de seed en entorno {settings.ENVIRONMENT}")
        raise HTTPException(
            status_code=403,
            detail="Este endpoint solo está disponible en entorno de desarrollo"
        )
    
    # Verificar la IP del cliente (solo permitir localhost)
    client_host = request.client.host
    if client_host not in ["127.0.0.1", "localhost", "::1"]:
        logger.warning(f"Intento de seed desde IP no permitida: {client_host}")
        raise HTTPException(
            status_code=403,
            detail="Este endpoint solo está disponible desde localhost"
        )
    
    from app.data_seed import seed_database
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        logger.info("Iniciando población de la base de datos")
        seed_database(db)
        logger.info("Base de datos poblada con éxito")
        return {"message": "Base de datos poblada con éxito"}
    except Exception as e:
        logger.error(f"Error poblando la base de datos: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error poblando la base de datos: {str(e)}"
        )
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)