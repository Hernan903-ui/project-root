from .user import User
from .category import Category
from .product import Product
from .inventory import InventoryMovement, MovementType
from .customer import Customer
from .sale import Sale, SaleItem, PaymentMethod
from .supplier import Supplier
from .purchase_order import PurchaseOrder, PurchaseOrderReceipt, PurchaseOrderReceiptItem

# Para crear todas las tablas
from ..database import Base, engine
Base.metadata.create_all(bind=engine)