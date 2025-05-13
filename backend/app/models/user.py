from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
        __tablename__ = "users"

        id = Column(Integer, primary_key=True, index=True)
        username = Column(String(length=50), unique=True, index=True) # Añade length
        email = Column(String(length=255), unique=True, index=True) # Añade length
        hashed_password = Column(String(length=255))               # Añade length (los hashes suelen tener longitud fija)
        full_name = Column(String(length=100), nullable=True)      # Añade length y quizás nullable si es opcional
        is_active = Column(Boolean, default=True)
        is_admin = Column(Boolean, default=False)
        created_at = Column(DateTime(timezone=True), server_default=func.now())
        updated_at = Column(DateTime(timezone=True), onupdate=func.now())