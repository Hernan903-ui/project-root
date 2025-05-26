from pydantic import BaseModel, Field, constr, root_validator
from typing import Optional, List, Annotated # Added Annotated
from datetime import datetime
from enum import Enum
import math # For isclose

# Forward declaration for Product and Customer to avoid circular import issues
# These stubs should ideally match the structure expected by SaleItemWithProduct and SaleWithItemsAndProducts
class Product(BaseModel): 
    id: int
    name: str
    class Config:
        orm_mode = True

class Customer(BaseModel): 
    id: int
    full_name: Optional[str] = None
    class Config:
        orm_mode = True

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
    product_id: Annotated[int, Field(gt=0)]
    quantity: Annotated[int, Field(gt=0)]
    unit_price: Annotated[float, Field(ge=0)]
    discount: Annotated[float, Field(default=0.0, ge=0)] = 0.0
    tax_rate: Annotated[float, Field(default=0.0, ge=0, le=1)] = 0.0 # Tax rate between 0 and 1
    total: Annotated[float, Field(ge=0)] # Total for the line item

    @root_validator(skip_on_failure=True) 
    def check_total_consistency(cls, values):
        unit_price = values.get('unit_price')
        quantity = values.get('quantity')
        discount = values.get('discount')
        tax_rate = values.get('tax_rate')
        total_provided = values.get('total')
        
        if unit_price is None or quantity is None or discount is None or tax_rate is None or total_provided is None:
            # This validator is primarily for SaleItemCreate where all fields are expected.
            # For partial updates, this might not be appropriate if not all values are present.
            return values

        calculated_total = (unit_price * quantity - discount) * (1 + tax_rate)
        if not math.isclose(calculated_total, total_provided, rel_tol=0.01): # relative tolerance of 1%
            raise ValueError(f'Total amount mismatch for sale item. Expected approx: {calculated_total:.2f}, Got: {total_provided:.2f}')
        return values

    @root_validator(skip_on_failure=True)
    def check_discount_validity(cls, values):
        unit_price = values.get('unit_price')
        quantity = values.get('quantity')
        discount = values.get('discount')

        if unit_price is None or quantity is None or discount is None:
            return values
            
        subtotal = unit_price * quantity
        if discount > subtotal:
            raise ValueError(f'Discount ({discount:.2f}) cannot be greater than item subtotal ({subtotal:.2f}).')
        return values

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemUpdate(BaseModel):
    product_id: Annotated[Optional[int], Field(gt=0)] = None
    quantity: Annotated[Optional[int], Field(gt=0)] = None
    unit_price: Annotated[Optional[float], Field(ge=0)] = None
    discount: Annotated[Optional[float], Field(ge=0)] = None
    tax_rate: Annotated[Optional[float], Field(ge=0, le=1)] = None
    total: Annotated[Optional[float], Field(ge=0)] = None
    # Note: For partial updates, cross-field validation like check_total_consistency 
    # is often better handled in the service/API route layer, as it might require fetching current values.

class SaleItemInDBBase(SaleItemBase):
    id: Annotated[int, Field(gt=0)]
    sale_id: Annotated[int, Field(gt=0)]

    class Config:
        orm_mode = True

class SaleItem(SaleItemInDBBase):
    pass

class SaleItemWithProduct(SaleItem):
    product: 'Product' # Uses string literal for forward reference

class SaleBase(BaseModel):
    invoice_number: Annotated[str, constr(min_length=1, max_length=50)]
    customer_id: Annotated[Optional[int], Field(gt=0)] = None # customer_id > 0 if provided
    total_amount: Annotated[float, Field(ge=0)] # Grand total of the sale
    tax_amount: Annotated[float, Field(default=0.0, ge=0)] = 0.0
    discount_amount: Annotated[float, Field(default=0.0, ge=0)] = 0.0 # Overall discount on sale
    payment_method: PaymentMethodEnum
    payment_status: PaymentStatusEnum = PaymentStatusEnum.PAID
    notes: Annotated[Optional[str], constr(max_length=250)] = None

class SaleCreate(SaleBase):
    items: Annotated[List[SaleItemCreate], Field(min_items=1)] # Must have at least one item

class SaleUpdate(BaseModel):
    customer_id: Annotated[Optional[int], Field(gt=0)] = None
    total_amount: Annotated[Optional[float], Field(ge=0)] = None
    tax_amount: Annotated[Optional[float], Field(ge=0)] = None
    discount_amount: Annotated[Optional[float], Field(ge=0)] = None
    payment_method: Optional[PaymentMethodEnum] = None
    payment_status: Optional[PaymentStatusEnum] = None
    notes: Annotated[Optional[str], constr(max_length=250)] = None

class SaleInDBBase(SaleBase):
    id: Annotated[int, Field(gt=0)]
    created_at: datetime
    created_by: Annotated[int, Field(ge=0)] # user ID, ge=0 if 0 can be a system/default user

    class Config:
        orm_mode = True

class Sale(SaleInDBBase):
    pass

class SaleWithItems(Sale):
    items: List[SaleItem]

class SaleWithItemsAndProducts(Sale):
    items: List[SaleItemWithProduct]
    customer: Optional['Customer'] = None # Uses string literal for forward reference