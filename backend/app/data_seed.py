# app/data_seed.py
import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models.user import User
from .models.category import Category
from .models.product import Product
from .models.customer import Customer
from .models.sale import Sale, SaleItem
from .models.inventory import InventoryMovement
from .utils.security import get_password_hash

def seed_database(db: Session, num_products=50, num_customers=20, num_sales=100) -> None:
    """
    Puebla la base de datos con datos de ejemplo.
    """
    print("Comenzando la población de la base de datos...")
    
    # 1. Crear categorías si no existen
    categories = [
        {"name": "Electrónica", "description": "Dispositivos electrónicos y accesorios"},
        {"name": "Ropa", "description": "Prendas de vestir y artículos de moda"},
        {"name": "Alimentos", "description": "Comestibles y productos alimenticios"},
        {"name": "Hogar", "description": "Artículos para el hogar y decoración"},
        {"name": "Salud y Belleza", "description": "Productos para el cuidado personal"},
        {"name": "Deportes", "description": "Equipamiento y ropa deportiva"},
        {"name": "Juguetes", "description": "Juguetes y artículos para niños"},
        {"name": "Libros", "description": "Libros, revistas y material de lectura"},
        {"name": "Herramientas", "description": "Herramientas y materiales de construcción"},
        {"name": "Mascotas", "description": "Productos para mascotas"}
    ]
    
    for cat_data in categories:
        existing_category = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not existing_category:
            category = Category(**cat_data)
            db.add(category)
    
    db.commit()
    print(f"Categorías creadas: {len(categories)}")
    
    # 2. Crear productos
    created_products = 0
    all_categories = db.query(Category).all()
    
    for i in range(num_products):
        # Generar SKU y barcode únicos
        sku = f"SKU-{i+1:04d}"
        barcode = ''.join(random.choices(string.digits, k=13))
        
        # Verificar si ya existe
        existing_product = db.query(Product).filter(Product.sku == sku).first()
        if existing_product:
            continue
        
        # Crear producto
        price = round(random.uniform(5.0, 1000.0), 2)
        cost_price = round(price * random.uniform(0.4, 0.8), 2)
        product = Product(
            name=f"Producto {i+1}",
            description=f"Descripción del producto {i+1}",
            sku=sku,
            barcode=barcode,
            price=price,
            cost_price=cost_price,
            tax_rate=random.choice([0, 5, 10, 16, 21]),
            category_id=random.choice(all_categories).id,
            stock_quantity=random.randint(0, 100),
            min_stock_level=random.randint(5, 20),
            is_active=True
        )
        db.add(product)
        created_products += 1
    
    db.commit()
    print(f"Productos creados: {created_products}")
    
    # 3. Crear clientes
    created_customers = 0
    
    for i in range(num_customers):
        email = f"cliente{i+1}@example.com"
        
        # Verificar si ya existe
        existing_customer = db.query(Customer).filter(Customer.email == email).first()
        if existing_customer:
            continue
        
        # Crear cliente
        customer = Customer(
            name=f"Cliente {i+1}",
            email=email,
            phone=f"+1 555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            address=f"{random.randint(100, 9999)} Calle Principal, Ciudad {random.randint(1, 100)}",
            tax_id=f"TAX{random.randint(10000, 99999)}",
            is_active=True
        )
        db.add(customer)
        created_customers += 1
    
    db.commit()
    print(f"Clientes creados: {created_customers}")
    
    # 4. Crear ventas
    all_products = db.query(Product).all()
    all_customers = db.query(Customer).all()
    
    # Crear usuario para las ventas si no existe
    system_user = db.query(User).filter(User.username == "admin").first()
    if not system_user:
        system_user = User(
            username="admin",
            email="admin@example.com",
            full_name="Admin User",
            hashed_password=get_password_hash("admin"),
            is_active=True,
            is_admin=True
        )
        db.add(system_user)
        db.commit()
    
    # Crear ventas
    created_sales = 0
    
    for i in range(num_sales):
        # Fecha de venta (últimos 90 días)
        sale_date = datetime.now() - timedelta(days=random.randint(0, 90))
        
        # Cliente (aleatorio o null)
        customer_id = random.choice([None] + [c.id for c in all_customers])
        
        # Crear cabecera de venta
        sale = Sale(
            invoice_number=f"INV-{i+1:05d}",
            customer_id=customer_id,
            total_amount=0,  # Se calculará después
            tax_amount=0,    # Se calculará después
            discount_amount=random.choice([0, 0, 0, 5, 10]),  # Mayoría sin descuento
            payment_method=random.choice(["cash", "credit_card", "debit_card"]),
            payment_status="paid",
            notes=None,
            created_at=sale_date,
            created_by=system_user.id
        )
        db.add(sale)
        db.flush()  # Para obtener el ID
        
        # Crear items de venta (entre 1 y 5 productos)
        num_items = random.randint(1, 5)
        selected_products = random.sample(all_products, num_items)
        
        total_amount = 0
        total_tax = 0
        
        for product in selected_products:
            quantity = random.randint(1, 3)
            unit_price = product.price
            discount = 0
            tax_rate = product.tax_rate
            
            # Calcular totales
            subtotal = quantity * unit_price
            tax_amount = subtotal * (tax_rate / 100)
            total = subtotal + tax_amount
            
            total_amount += total
            total_tax += tax_amount
            
            # Crear el item
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                discount=discount,
                tax_rate=tax_rate,
                total=total
            )
            db.add(sale_item)
            
            # Registrar movimiento de inventario
            inventory_movement = InventoryMovement(
                product_id=product.id,
                movement_type="sale",
                quantity=-quantity,  # Negativo porque es una salida
                reference_id=sale.id,
                notes=f"Sale: {sale.invoice_number}",
                created_at=sale_date,
                created_by=system_user.id
            )
            db.add(inventory_movement)
            
            # Actualizar inventario del producto
            product.stock_quantity = max(0, product.stock_quantity - quantity)
            db.add(product)
        
        # Actualizar totales en la cabecera de venta
        discount_amount = total_amount * (sale.discount_amount / 100) if sale.discount_amount else 0
        total_after_discount = total_amount - discount_amount
        
        sale.total_amount = total_after_discount
        sale.tax_amount = total_tax
        db.add(sale)
        
        created_sales += 1
    
    db.commit()
    print(f"Ventas creadas: {created_sales}")
    
    # 5. Crear algunos movimientos de inventario adicionales (compras, ajustes)
    inventory_movements = 0
    
    for i in range(30):
        product = random.choice(all_products)
        
        # Determinar tipo y cantidad
        movement_type = random.choice(["purchase", "adjustment", "initial"])
        
        if movement_type == "purchase":
            quantity = random.randint(5, 50)
            notes = f"Purchase from supplier #{random.randint(1000, 9999)}"
        elif movement_type == "adjustment":
            quantity = random.randint(-5, 5)  # Puede ser positivo o negativo
            notes = "Inventory adjustment"
        else:  # initial
            quantity = random.randint(10, 100)
            notes = "Initial inventory"
        
        # Fecha (entre 100 y 1 día atrás)
        movement_date = datetime.now() - timedelta(days=random.randint(1, 100))
        
        # Crear movimiento
        inventory_movement = InventoryMovement(
            product_id=product.id,
            movement_type=movement_type,
            quantity=quantity,
            reference_id=None,
            notes=notes,
            created_at=movement_date,
            created_by=system_user.id
        )
        db.add(inventory_movement)
        
        # Actualizar inventario del producto (solo si no es un movimiento de venta)
        product.stock_quantity = max(0, product.stock_quantity + quantity)
        db.add(product)
        
        inventory_movements += 1
    
    db.commit()
    print(f"Movimientos de inventario adicionales creados: {inventory_movements}")
    
    print("Población de la base de datos completada con éxito.")

def run_seed(db: Session):
    """
    Ejecuta la función de semilla si se ejecuta el script directamente.
    """
    seed_database(db)

if __name__ == "__main__":
    # Este código se ejecuta solo si se ejecuta el script directamente
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()