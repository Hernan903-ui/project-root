from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class PurchaseOrderItemBase(BaseModel):
    """Esquema base para items de orden de compra"""
    product_id: int = Field(..., description="ID del producto")
    quantity: int = Field(..., gt=0, description="Cantidad del producto")
    unit_price: float = Field(..., ge=0, description="Precio unitario")
    notes: Optional[str] = Field(None, description="Notas del item")

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    """Esquema para crear item de orden de compra"""
    pass

class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    """Esquema para respuesta de item de orden de compra"""
    id: int
    product_name: Optional[str] = None
    subtotal: float
    
    model_config = ConfigDict(from_attributes=True)

class PurchaseOrderBase(BaseModel):
    """Esquema base para orden de compra"""
    supplier_id: int = Field(..., description="ID del proveedor")
    expected_delivery_date: Optional[datetime] = Field(None, description="Fecha esperada de entrega")
    payment_terms: Optional[str] = Field(None, max_length=100, description="Términos de pago")
    shipping_method: Optional[str] = Field(None, max_length=100, description="Método de envío")
    notes: Optional[str] = Field(None, description="Notas de la orden")

class PurchaseOrderCreate(PurchaseOrderBase):
    """Esquema para crear orden de compra"""
    items: List[PurchaseOrderItemCreate] = Field(..., min_length=1, description="Items de la orden")

class PurchaseOrderUpdate(BaseModel):
    """Esquema para actualizar orden de compra"""
    supplier_id: Optional[int] = Field(None, description="ID del proveedor")
    expected_delivery_date: Optional[datetime] = Field(None, description="Fecha esperada de entrega")
    payment_terms: Optional[str] = Field(None, max_length=100, description="Términos de pago")
    shipping_method: Optional[str] = Field(None, max_length=100, description="Método de envío")
    notes: Optional[str] = Field(None, description="Notas de la orden")
    status: Optional[str] = Field(None, description="Estado de la orden")

class PurchaseOrder(PurchaseOrderBase):
    """Esquema completo de orden de compra"""
    id: int
    order_number: str
    supplier_name: Optional[str] = None
    order_date: datetime
    status: str
    total_amount: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[PurchaseOrderItemResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class ReceiptItemBase(BaseModel):
    """Esquema base para item de recepción"""
    product_id: int = Field(..., description="ID del producto")
    quantity_received: int = Field(..., ge=0, description="Cantidad recibida")
    quantity_rejected: Optional[int] = Field(0, ge=0, description="Cantidad rechazada")
    rejection_reason: Optional[str] = Field(None, description="Razón del rechazo")

class ReceiptItemCreate(ReceiptItemBase):
    """Esquema para crear item de recepción"""
    pass

class ReceiptItemResponse(ReceiptItemBase):
    """Esquema para respuesta de item de recepción"""
    id: int
    product_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ReceiptCreate(BaseModel):
    """Esquema para crear recepción"""
    received_by: Optional[int] = Field(None, description="ID del usuario que recibe")
    notes: Optional[str] = Field(None, description="Notas de la recepción")
    items: List[ReceiptItemCreate] = Field(..., min_length=1, description="Items recibidos")

class Receipt(BaseModel):
    """Esquema completo de recepción"""
    id: int
    purchase_order_id: int
    receipt_date: datetime
    received_by: Optional[int] = None
    status: str
    notes: Optional[str] = None
    items: List[ReceiptItemResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
