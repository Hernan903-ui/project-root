from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    sku = Column(String, unique=True, index=True)
    barcode = Column(String, unique=True, nullable=True, index=True)
    price = Column(Float)
    cost_price = Column(Float)
    tax_rate = Column(Float, default=0.0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    stock_quantity = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    category = relationship("Category", back_populates="products")
    inventory_movements = relationship("InventoryMovement", back_populates="product")
    sale_items = relationship("SaleItem", back_populates="product")