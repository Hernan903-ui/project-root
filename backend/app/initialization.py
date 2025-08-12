#backend/app/initialization.py
import logging
from sqlalchemy.orm import Session
from sqlalchemy import inspect
from .database import SessionLocal, engine, Base
from .models.user import User
from .utils.security import get_password_hash
import os
from dotenv import load_dotenv

# Importar todos los modelos para que SQLAlchemy los reconozca
from .models.user import User
from .models.category import Category
from .models.product import Product
from .models.customer import Customer
from .models.sale import Sale, SaleItem
from .models.inventory import InventoryMovement
from .models.supplier import Supplier  # Asegúrate de importar el modelo de Supplier
# Importar también purchase_order si lo has creado
from .models.purchase_order import PurchaseOrder, purchase_order_items, PurchaseOrderReceipt, PurchaseOrderReceiptItem

load_dotenv()

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables() -> None:
    """
    Crea todas las tablas definidas en los modelos que no existen en la base de datos.
    """
    logger.info("Verificando y creando tablas necesarias...")
    
    # Obtener tablas existentes
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # Crear todas las tablas que no existen
    tables_created = 0
    for table in Base.metadata.sorted_tables:
        if table.name not in existing_tables:
            logger.info(f"Creando tabla: {table.name}")
            table.create(engine)
            tables_created += 1
    
    if tables_created > 0:
        logger.info(f"Se crearon {tables_created} tablas nuevas")
    else:
        logger.info("Todas las tablas ya existen")

def init_db() -> None:
    """
    Inicializa la base de datos con datos necesarios (usuario admin) y crea tablas faltantes.
    """
    # Primero creamos las tablas que faltan
    create_tables()
    
    # Luego inicializamos datos básicos
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