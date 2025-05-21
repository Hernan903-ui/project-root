from pydantic import BaseModel, validator, root_validator
from typing import Optional, List, Annotated
from datetime import datetime
from enum import Enum
import math # For isclose

# Forward declaration for Product and Customer to avoid circular import issues
class Product(BaseModel): 
    id: int
    name: str
    
    class Config:
        from_attributes = True  # Actualizado desde orm_mode

class Customer(BaseModel): 
    id: int
    full_name: Optional[str] = None
    
    class Config:
        from_attributes = True  # Actualizado desde orm_mode

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
    
    # Validadores para reemplazar los Field
    @validator('product_id', 'quantity')
    def validate_positive_int(cls, v, field):
        if v <= 0:
            raise ValueError(f'{field.name} must be greater than 0')
        return v
    
    @validator('unit_price', 'total')
    def validate_non_negative_float(cls, v, field):
        if v < 0:
            raise ValueError(f'{field.name} must be non-negative')
        return v
    
    @validator('discount')
    def validate_discount(cls, v):
        if v < 0:
            raise ValueError('discount must be non-negative')
        return v
    
    @validator('tax_rate')
    def validate_tax_rate(cls, v):
        if v < 0 or v > 1:
            raise ValueError('tax_rate must be between 0 and 1')
        return v

    @root_validator(skip_on_failure=True) 
    def check_total_consistency(cls, values):
        unit_price = values.get('unit_price')
        quantity = values.get('quantity')
        discount = values.get('discount')
        tax_rate = values.get('tax_rate')
        total_provided = values.get('total')
        
        calculated_total = (unit_price * quantity - discount) * (1 + tax_rate)
        if not math.isclose(calculated_total, total_provided, rel_tol=0.01): # Use a relative tolerance of 1%
            raise ValueError(f'Total amount mismatch for sale item. Expected approx: {calculated_total:.2f}, Got: {total_provided:.2f}')
        return values

    @root_validator(skip_on_failure=True)
    def check_discount_validity(cls, values):
        unit_price = values.get('unit_price')
        quantity = values.get('quantity')
        discount = values.get('discount')
        
        subtotal = unit_price * quantity
        if discount > subtotal:
            raise ValueError(f'Discount ({discount:.2f}) cannot be greater than item subtotal ({subtotal:.2f}).')
        return values

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemUpdate(BaseModel):
    product_id: Optional[int] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    discount: Optional[float] = None
    tax_rate: Optional[float] = None
    total: Optional[float] = None
    
    # Validaciones cuando los campos están presentes
    @validator('product_id', 'quantity', each_item=False)
    def validate_positive_int(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Value must be greater than 0')
        return v
    
    @validator('unit_price', 'discount', 'total')
    def validate_non_negative_float(cls, v):
        if v is not None and v < 0:
            raise ValueError('Value must be non-negative')
        return v
    
    @validator('tax_rate')
    def validate_tax_rate(cls, v):
        if v is not None and (v < 0 or v > 1):
            raise ValueError('tax_rate must be between 0 and 1')
        return v

class SaleItemInDBBase(SaleItemBase):
    id: int
    sale_id: int

    # Validadores adicionales para id y sale_id
    @validator('id', 'sale_id')
    def validate_ids(cls, v):
        if v <= 0:
            raise ValueError('ID must be greater than 0')
        return v
    
    class Config:
        from_attributes = True  # Actualizado desde orm_mode

class SaleItem(SaleItemInDBBase):
    pass

class SaleItemWithProduct(SaleItem):
    product: Product  # Ya no necesita ser string literal con estos cambios

class SaleBase(BaseModel):
    invoice_number: str
    customer_id: Optional[int] = None
    total_amount: float
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    payment_method: PaymentMethodEnum
    payment_status: PaymentStatusEnum = PaymentStatusEnum.PAID
    notes: Optional[str] = None
    
    # Validadores para reemplazar los constr y Field
    @validator('invoice_number')
    def validate_invoice_number(cls, v):
        if not v or len(v) < 1 or len(v) > 50:
            raise ValueError('invoice_number must be 1-50 characters')
        return v
    
    @validator('notes')
    def validate_notes(cls, v):
        if v and len(v) > 250:
            raise ValueError('notes must be at most 250 characters')
        return v
    
    @validator('customer_id')
    def validate_customer_id(cls, v):
        if v is not None and v <= 0:
            raise ValueError('customer_id must be greater than 0')
        return v
    
    @validator('total_amount', 'tax_amount', 'discount_amount')
    def validate_amounts(cls, v, field):
        if v < 0:
            raise ValueError(f'{field.name} must be non-negative')
        return v

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]
    
    @validator('items')
    def validate_items(cls, v):
        if not v or len(v) < 1:
            raise ValueError('A sale must have at least one item')
        return v

class SaleUpdate(BaseModel):
    customer_id: Optional[int] = None
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    payment_method: Optional[PaymentMethodEnum] = None
    payment_status: Optional[PaymentStatusEnum] = None
    notes: Optional[str] = None
    
    # Validadores cuando los campos están presentes
    @validator('customer_id')
    def validate_customer_id(cls, v):
        if v is not None and v <= 0:
            raise ValueError('customer_id must be greater than 0')
        return v
    
    @validator('total_amount', 'tax_amount', 'discount_amount')
    def validate_amounts(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount values must be non-negative')
        return v
    
    @validator('notes')
    def validate_notes(cls, v):
        if v is not None and len(v) > 250:
            raise ValueError('notes must be at most 250 characters')
        return v

class SaleInDBBase(SaleBase):
    id: int
    created_at: datetime
    created_by: int
    
    @validator('id', 'created_by')
    def validate_ids(cls, v, field):
        if field.name == 'id' and v <= 0:
            raise ValueError('id must be greater than 0')
        if field.name == 'created_by' and v < 0:
            raise ValueError('created_by must be non-negative')
        return v
    
    class Config:
        from_attributes = True  # Actualizado desde orm_mode

class Sale(SaleInDBBase):
    pass

class SaleWithItems(Sale):
    items: List[SaleItem]

class SaleWithItemsAndProducts(Sale):
    items: List[SaleItemWithProduct]
    customer: Optional[Customer] = None  # Ya no necesita ser string literal