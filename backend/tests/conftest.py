# tests/conftest.py
import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.database import Base, get_db
from app.models import User, Category, Product
from app.utils.security import get_password_hash
from main import app

# Crear base de datos en memoria para las pruebas
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    # Crear las tablas en la base de datos
    Base.metadata.create_all(bind=engine)
    yield engine
    # Eliminar las tablas después de terminar las pruebas
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    # Cada prueba recibe una sesión de base de datos limpia
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Crear datos básicos para las pruebas
    _create_test_data(session)
    
    yield session
    
    # Rollback de la transacción y cierre de la conexión
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db):
    # Crear un cliente de prueba usando la sesión de base de datos
    def _get_test_db():
        try:
            yield db
        finally:
            pass
    
    # Sobreescribir la dependencia get_db
    app.dependency_overrides[get_db] = _get_test_db
    
    with TestClient(app) as c:
        yield c
    
    # Restaurar la dependencia original
    app.dependency_overrides.clear()

def _create_test_data(db):
    # Crear un usuario de prueba
    test_user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("password"),
        full_name="Test User",
        is_active=True,
        is_admin=False
    )
    db.add(test_user)
    
    # Crear un usuario administrador
    admin_user = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin"),
        full_name="Admin User",
        is_active=True,
        is_admin=True
    )
    db.add(admin_user)
    
    # Crear algunas categorías
    categories = [
        Category(name="Electronics", description="Electronic devices and accessories"),
        Category(name="Clothing", description="Apparel and fashion items"),
        Category(name="Food", description="Groceries and food items")
    ]
    for category in categories:
        db.add(category)
    
    # Commit para obtener IDs
    db.commit()
    
    # Crear algunos productos
    products = [
        Product(
            name="Smartphone",
            description="Latest model smartphone",
            sku="PHONE-001",
            barcode="123456789",
            price=699.99,
            cost_price=499.99,
            tax_rate=10.0,
            category_id=1,
            stock_quantity=25,
            min_stock_level=5,
            is_active=True
        ),
        Product(
            name="T-shirt",
            description="Cotton t-shirt",
            sku="TSHIRT-001",
            barcode="234567890",
            price=19.99,
            cost_price=5.99,
            tax_rate=5.0,
            category_id=2,
            stock_quantity=100,
            min_stock_level=20,
            is_active=True
        ),
        Product(
            name="Chocolate Bar",
            description="Premium chocolate",
            sku="CHOC-001",
            barcode="345678901",
            price=3.99,
            cost_price=1.50,
            tax_rate=8.0,
            category_id=3,
            stock_quantity=50,
            min_stock_level=10,
            is_active=True
        )
    ]
    for product in products:
        db.add(product)
    
    db.commit()