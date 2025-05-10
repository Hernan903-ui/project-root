import logging
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models.user import User
from .utils.security import get_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    """
    Inicializa la base de datos con datos necesarios (usuario admin).
    """
    db = SessionLocal()
    try:
        # Verificar si ya existe el usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            create_admin_user(db)
        else:
            logger.info("Admin user already exists. Skipping.")
    finally:
        db.close()

def create_admin_user(db: Session) -> None:
    """
    Crea un usuario administrador inicial.
    """
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    
    admin_user = User(
        username=admin_username,
        email=admin_email,
        hashed_password=get_password_hash(admin_password),
        full_name="Administrator",
        is_active=True,
        is_admin=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    logger.info(f"Admin user created with username: {admin_username}")