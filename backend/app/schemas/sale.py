from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PaymentMethodEnum(str, Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    OTHER = "other"

class PaymentStatusEnum(str, Enum):
    PAID = "paid"
    PENDING = "pending"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class SaleItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0
    tax_rate: float = 0.0
    total: float

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    discount: Optional[float] = None
    total: Optional[float] = None

class SaleItemInDBBase(SaleItemBase):
    id: int
    sale_id: int

    class Config:
        orm_mode = True

class SaleItem(SaleItemInDBBase):
    pass

class SaleItemWithProduct(SaleItem):
    product: "Product"

class SaleBase(BaseModel):
    invoice_number: str
    customer_id: Optional[int] = None
    total_amount: float
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    payment_method: PaymentMethodEnum
    payment_status: PaymentStatusEnum = PaymentStatusEnum.PAID
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class SaleUpdate(BaseModel):
    customer_id: Optional[int] = None
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    payment_method: Optional[PaymentMethodEnum] = None
    payment_status: Optional[PaymentStatusEnum] = None
    notes: Optional[str] = None

class SaleInDBBase(SaleBase):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        orm_mode = True

class Sale(SaleInDBBase):
    pass

class SaleWithItems(Sale):
    items: List[SaleItem]

class SaleWithItemsAndProducts(Sale):
    items: List[SaleItemWithProduct]
    customer: Optional["Customer"] = None

from .product import Product
from .customer import Customer