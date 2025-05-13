import os
from typing import Optional, Dict, Any
from pydantic_settings import BaseSettings # <--- Importación correcta
from pydantic import AnyUrl, validator # Otras importaciones de pydantic
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        
        # Base de datos
        DATABASE_URL: AnyUrl
        
        # Seguridad
        SECRET_KEY: str
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        
        # Servidor
        API_PORT: int = 8000
        API_HOST: str = "0.0.0.0"
        CORS_ORIGINS: list = ["http://localhost:3000"]
        
        # Administrador por defecto
        ADMIN_USERNAME: str = "admin"
        ADMIN_PASSWORD: str = "admin123"
        ADMIN_EMAIL: str = "admin@example.com"
        
        # Carpetas
        REPORTS_FOLDER: str = "reports"
        UPLOADS_FOLDER: str = "uploads"
        
        # Logging
        LOG_LEVEL: str = "INFO"
        
        class Config:
            env_file = ".env"
            env_file_encoding = "utf-8"
            case_sensitive = True

    # Crear instancia de configuración
settings = Settings()