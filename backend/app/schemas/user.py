from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import re

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="Correo electrónico del usuario")
    full_name: Optional[str] = Field(None, description="Nombre completo del usuario")

class UserAdminBase(UserBase):
    username: str = Field(..., description="Nombre de usuario para inicio de sesión")
    is_admin: bool = Field(False, description="Indica si el usuario tiene permisos de administrador")

# Esquema específico para registro público de usuarios
class UserCreate(UserBase):
    """Esquema para la creación de usuarios desde el formulario de registro público"""
    password: str = Field(..., min_length=8, description="Contraseña del usuario (mínimo 8 caracteres)")
    username: str = Field(..., description="Nombre de usuario para inicio de sesión")
    
    # Validadores
    @validator('username')
    def username_valid(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('El nombre de usuario solo puede contener letras, números y guiones bajos')
        if len(v) < 3:
            raise ValueError('El nombre de usuario debe tener al menos 3 caracteres')
        return v
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v

# Esquema para la creación de usuarios por administradores
class UserAdminCreate(UserAdminBase):
    """Esquema para la creación de usuarios por administradores"""
    password: str = Field(..., min_length=8, description="Contraseña del usuario")

class UserUpdate(BaseModel):
    """Esquema para actualizar datos de usuario"""
    username: Optional[str] = Field(None, description="Nombre de usuario para inicio de sesión")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico del usuario")
    full_name: Optional[str] = Field(None, description="Nombre completo del usuario")
    is_active: Optional[bool] = Field(None, description="Estado de activación del usuario")
    is_admin: Optional[bool] = Field(None, description="Indica si el usuario tiene permisos de administrador")
    password: Optional[str] = Field(None, min_length=8, description="Nueva contraseña")
    
    # Validador para username si se proporciona
    @validator('username')
    def username_valid(cls, v):
        if v is not None:
            if not re.match(r'^[a-zA-Z0-9_]+$', v):
                raise ValueError('El nombre de usuario solo puede contener letras, números y guiones bajos')
            if len(v) < 3:
                raise ValueError('El nombre de usuario debe tener al menos 3 caracteres')
        return v

class UserInDBBase(UserAdminBase):
    """Esquema base para usuarios en la base de datos"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Actualizado de orm_mode a from_attributes

# Esquema para respuestas de API (evita exponer información sensible)
class UserResponse(BaseModel):
    """Esquema para respuestas de API de usuarios"""
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Para compatibilidad con el código existente
class User(UserInDBBase):
    pass

# Renombrado User a UserRead para coincidir con la importación en users.py
class UserRead(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    """Esquema para representar usuarios con información de contraseña hasheada"""
    hashed_password: str