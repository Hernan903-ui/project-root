from fastapi import Request
import time
import logging
import uuid

# Configurar logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("api")

async def logging_middleware(request: Request, call_next):
    """Middleware para registrar solicitudes y respuestas."""
    request_id = str(uuid.uuid4())
    
    # Registrar detalles de la solicitud
    logger.info(f"Request {request_id} start: {request.method} {request.url.path}")
    
    # Medir tiempo de respuesta
    start_time = time.time()
    
    # Procesar la solicitud
    response = await call_next(request)
    
    # Calcular tiempo de procesamiento
    process_time = time.time() - start_time
    
    # Registrar detalles de la respuesta
    logger.info(
        f"Request {request_id} completed: status_code={response.status_code}, "
        f"process_time={process_time:.4f}s"
    )
    
    # Añadir headers con información de la solicitud
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Request-ID"] = request_id
    
    return response