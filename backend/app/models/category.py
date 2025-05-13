from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database import Base
from sqlalchemy.orm import relationship


class Category(Base):
        __tablename__ = "categories"

        id = Column(Integer, primary_key=True, index=True)
        name = Column(String(length=50), unique=True, index=True) # Añade length
        description = Column(String(length=255), nullable=True)
        products = relationship("Product", back_populates="category")
        created_at = Column(DateTime(timezone=True), server_default=func.now())
        updated_at = Column(DateTime(timezone=True), onupdate=func.now())