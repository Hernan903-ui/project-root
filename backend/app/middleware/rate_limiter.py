from fastapi import Request, HTTPException, status
import time
from typing import Dict, List, Tuple
import asyncio

class RateLimiter:
    def __init__(self, calls: int = 10, period: int = 60):
        self.calls = calls  # número máximo de llamadas permitidas en el período
        self.period = period  # período en segundos
        self.tokens: Dict[str, List[float]] = {}  # diccionario para almacenar tokens
        self.lock = asyncio.Lock()  # lock para acceso concurrente
    
    async def _clean_old_tokens(self, ip: str):
        """Limpia tokens antiguos para una IP."""
        if ip in self.tokens:
            now = time.time()
            self.tokens[ip] = [t for t in self.tokens[ip] if now - t < self.period]
    
    async def is_rate_limited(self, request: Request) -> bool:
        """Verifica si una solicitud debe ser limitada por rate limiting."""
        ip = request.client.host
        
        async with self.lock:
            await self._clean_old_tokens(ip)
            
            # Si no hay tokens para esta IP, inicializarlos
            if ip not in self.tokens:
                self.tokens[ip] = []
            
            # Verificar si se ha excedido el límite
            if len(self.tokens[ip]) >= self.calls:
                return True
            
            # Agregar el token
            self.tokens[ip].append(time.time())
            return False

# Instancia global del limitador de velocidad
rate_limiter = RateLimiter()

async def rate_limiting_middleware(request: Request, call_next):
    """Middleware para implementar rate limiting."""
    # Excluir rutas específicas del rate limiting, como la documentación
    if request.url.path.startswith(("/docs", "/redoc", "/openapi.json")):
        return await call_next(request)
    
    # Verificar rate limiting
    is_limited = await rate_limiter.is_rate_limited(request)
    if is_limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
    
    # Procesar la solicitud normalmente
    return await call_next(request)