from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict

class SupplierBase(BaseModel):
    """Esquema base para datos de proveedores"""
    name: str = Field(..., min_length=2, max_length=100, description="Nombre del proveedor")
    contact_person: Optional[str] = Field(None, max_length=100, description="Persona de contacto")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico del proveedor")
    phone: Optional[str] = Field(None, max_length=20, description="Teléfono del proveedor")
    address: Optional[str] = Field(None, description="Dirección del proveedor")
    city: Optional[str] = Field(None, max_length=50, description="Ciudad")
    country: Optional[str] = Field(None, max_length=50, description="País")
    status: str = Field("active", description="Estado del proveedor (active/inactive)")
    
    @validator('status')
    def validate_status(cls, v):
        """Validar que el estado sea 'active' o 'inactive'"""
        if v not in ["active", "inactive"]:
            raise ValueError("El estado debe ser 'active' o 'inactive'")
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validar formato de teléfono básico"""
        if v is not None and not v.strip():
            return None
        
        if v is not None and not all(c.isdigit() or c in "+-() " for c in v):
            raise ValueError("El teléfono debe contener solo números y los caracteres +, -, (, ), espacio")
        return v

class SupplierCreate(SupplierBase):
    """Esquema para crear un proveedor"""
    pass

class SupplierUpdate(BaseModel):
    """Esquema para actualizar un proveedor, todos los campos son opcionales"""
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Nombre del proveedor")
    contact_person: Optional[str] = Field(None, max_length=100, description="Persona de contacto")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico del proveedor")
    phone: Optional[str] = Field(None, max_length=20, description="Teléfono del proveedor")
    address: Optional[str] = Field(None, description="Dirección del proveedor")
    city: Optional[str] = Field(None, max_length=50, description="Ciudad")
    country: Optional[str] = Field(None, max_length=50, description="País")
    status: Optional[str] = Field(None, description="Estado del proveedor (active/inactive)")
    
    @validator('status')
    def validate_status(cls, v):
        """Validar que el estado sea 'active' o 'inactive' o None"""
        if v is not None and v not in ["active", "inactive"]:
            raise ValueError("El estado debe ser 'active' o 'inactive'")
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validar formato de teléfono básico"""
        if v is not None and not v.strip():
            return None
        
        if v is not None and not all(c.isdigit() or c in "+-() " for c in v):
            raise ValueError("El teléfono debe contener solo números y los caracteres +, -, (, ), espacio")
        return v

class SupplierInDB(SupplierBase):
    """Esquema para representar un proveedor almacenado en la base de datos"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class SupplierResponse(SupplierInDB):
    """Esquema para la respuesta de la API de proveedores"""
    # Aquí podrías añadir campos calculados o información adicional
    # específica para respuestas de API
    pass

class SupplierWithPurchaseOrders(SupplierResponse):
    """Esquema para proveedor con sus órdenes de compra relacionadas"""
    purchase_orders: List["PurchaseOrderResponse"] = []
    
    model_config = ConfigDict(from_attributes=True)

# Solo para referencia, este sería el esquema básico de órdenes de compra
# que se usaría en SupplierWithPurchaseOrders
class PurchaseOrderResponse(BaseModel):
    """Esquema básico para respuesta de órdenes de compra"""
    id: int
    order_number: str
    date: datetime
    status: str
    total_amount: float
    
    model_config = ConfigDict(from_attributes=True)

# Actualizar referencia forward
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.schemas.purchase_order import PurchaseOrderResponse