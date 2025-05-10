from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.customer import Customer
from ...schemas.customer import CustomerCreate, CustomerUpdate, Customer as CustomerSchema
from ...api.routes.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[CustomerSchema])
def read_customers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve customers.
    """
    query = db.query(Customer)
    
    if is_active is not None:
        query = query.filter(Customer.is_active == is_active)
    
    if search:
        query = query.filter(
            Customer.name.ilike(f"%{search}%") | 
            Customer.email.ilike(f"%{search}%") |
            Customer.phone.ilike(f"%{search}%") |
            Customer.tax_id.ilike(f"%{search}%")
        )
    
    customers = query.offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=CustomerSchema)
def create_customer(
    *,
    db: Session = Depends(get_db),
    customer_in: CustomerCreate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Create new customer.
    """
    # Verificar si ya existe un cliente con el mismo email
    if customer_in.email:
        existing_email = db.query(Customer).filter(Customer.email == customer_in.email).first()
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="A customer with this email already exists.",
            )
    
    customer = Customer(**customer_in.dict())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/{id}", response_model=CustomerSchema)
def update_customer(
    *,
    db: Session = Depends(get_db),
    id: int,
    customer_in: CustomerUpdate,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Update a customer.
    """
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verificar si se está actualizando el email y ya existe otro cliente con ese email
    if customer_in.email and customer_in.email != customer.email:
        existing_email = db.query(Customer).filter(Customer.email == customer_in.email).first()
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="A customer with this email already exists.",
            )
    
    update_data = customer_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{id}", response_model=CustomerSchema)
def read_customer(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Get customer by ID.
    """
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.delete("/{id}", response_model=CustomerSchema)
def delete_customer(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Any = Depends(get_current_active_user),
) -> Any:
    """
    Delete a customer (mark as inactive).
    """
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # En lugar de eliminar, marcamos como inactivo
    customer.is_active = False
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer