from typing import List, Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator

# Esquemas para elementos de la orden
class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    notes: Optional[str] = None

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    product_name: Optional[str] = None
    subtotal: float
    
    class Config:
        from_attributes = True  # Reemplazado orm_mode por from_attributes

# Esquemas para la orden de compra
class PurchaseOrderBase(BaseModel):
    supplier_id: int
    expected_delivery_date: Optional[datetime] = None
    payment_terms: Optional[str] = None
    shipping_method: Optional[str] = None
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]
    
    # Reemplazado root_validator por model_validator
    @model_validator(mode='after')
    def calculate_totals(self):
        if hasattr(self, 'items') and self.items:
            for item in self.items:
                # Calcular subtotal para cada item
                # Nota: en Pydantic v2, debes modificar el objeto directamente
                setattr(item, 'subtotal', item.quantity * item.unit_price)
        return self

class PurchaseOrderUpdate(BaseModel):
    supplier_id: Optional[int] = None
    expected_delivery_date: Optional[datetime] = None
    status: Optional[str] = None
    payment_terms: Optional[str] = None
    shipping_method: Optional[str] = None
    notes: Optional[str] = None
    
    # Reemplazado validator por field_validator
    @field_validator('status')
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ["pending", "approved", "received", "cancelled"]
            if v not in valid_statuses:
                raise ValueError(f"Status must be one of {valid_statuses}")
        return v

class PurchaseOrder(PurchaseOrderBase):
    id: int
    order_number: str
    order_date: datetime
    status: str
    total_amount: float
    supplier_name: Optional[str] = None
    items: List[PurchaseOrderItem]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Reemplazado orm_mode por from_attributes

# Esquemas para recepción de mercancía
class ReceiptItemBase(BaseModel):
    product_id: int
    quantity_received: int = Field(..., ge=0)
    quantity_rejected: Optional[int] = Field(0, ge=0)
    rejection_reason: Optional[str] = None

class ReceiptCreate(BaseModel):
    items: List[ReceiptItemBase]
    notes: Optional[str] = None
    received_by: Optional[int] = None

class ReceiptItem(ReceiptItemBase):
    id: int
    product_name: Optional[str] = None
    
    class Config:
        from_attributes = True  # Reemplazado orm_mode por from_attributes

class Receipt(BaseModel):
    id: int
    purchase_order_id: int
    receipt_date: datetime
    received_by: Optional[int] = None
    status: str
    notes: Optional[str] = None
    items: List[ReceiptItem]
    
    class Config:
        from_attributes = True  # Reemplazado orm_mode por from_attributes