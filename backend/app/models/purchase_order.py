#app/models/purchase_order.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

# Tabla de asociación para elementos de orden de compra
purchase_order_items = Table(
    'purchase_order_items',
    Base.metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('purchase_order_id', Integer, ForeignKey('purchase_orders.id', ondelete='CASCADE')),
    Column('product_id', Integer, ForeignKey('products.id')),
    Column('quantity', Integer, nullable=False),
    Column('unit_price', Float, nullable=False),
    Column('subtotal', Float, nullable=False),
    Column('notes', Text, nullable=True),
)


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=False)
    order_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expected_delivery_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="pending", nullable=False) # pending, approved, received, cancelled
    total_amount = Column(Float, default=0.0, nullable=False)
    payment_terms = Column(String(100), nullable=True)
    shipping_method = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("Product", secondary=purchase_order_items, backref="purchase_orders")
    
    # Historial de recepción (si decides implementarlo)
    receipt_history = relationship("PurchaseOrderReceipt", back_populates="purchase_order")

class PurchaseOrderReceipt(Base):
    __tablename__ = "purchase_order_receipts"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey('purchase_orders.id', ondelete='CASCADE'), nullable=False)
    receipt_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    received_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    status = Column(String(20), default="partial", nullable=False) # partial, complete
    notes = Column(Text, nullable=True)
    
    # Relaciones
    purchase_order = relationship("PurchaseOrder", back_populates="receipt_history")
    receipt_items = relationship("PurchaseOrderReceiptItem", back_populates="receipt")

class PurchaseOrderReceiptItem(Base):
    __tablename__ = "purchase_order_receipt_items"

    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey('purchase_order_receipts.id', ondelete='CASCADE'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity_received = Column(Integer, nullable=False)
    quantity_rejected = Column(Integer, default=0)
    rejection_reason = Column(Text, nullable=True)
    
    # Relaciones
    receipt = relationship("PurchaseOrderReceipt", back_populates="receipt_items")
    product = relationship("Product")