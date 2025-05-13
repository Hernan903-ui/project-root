from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=50), index=True)
    email = Column(String(length=250), unique=True, nullable=True, index=True)
    phone = Column(String(length=50), nullable=True)
    address = Column(String(length=50), nullable=True)
    tax_id = Column(String(length=50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    sales = relationship("Sale", back_populates="customer")