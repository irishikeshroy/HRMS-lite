from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import employee as schemas
from app.crud import employee as crud

router = APIRouter()

@router.get("/", response_model=schemas.PaginatedEmployeeResponse)
def list_employees(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: Optional[str] = None,
    department: Optional[str] = None
):
    """Retrieve paginated employees."""
    return crud.get_employees_paginated(db, page=page, page_size=page_size, search=search, department=department)

@router.post("/", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_in: schemas.EmployeeCreate,
    db: Session = Depends(get_db)
):
    """
    Create new employee.
    """
    # Validate unique employee ID
    db_emp_code = crud.get_employee_by_emp_code(db, emp_code=employee_in.employee_id)
    if db_emp_code:
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    
    # Validate unique email
    db_email = crud.get_employee_by_email(db, email=employee_in.email)
    if db_email:
        raise HTTPException(status_code=409, detail="Email already registered")
        
    employee = crud.create_employee(db=db, employee=employee_in)
    return employee

@router.get("/{id}", response_model=schemas.EmployeeResponse)
def get_employee(id: str, db: Session = Depends(get_db)):
    """
    Get a specific employee by ID.
    """
    employee = crud.get_employee_by_id(db, employee_id=id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(id: str, db: Session = Depends(get_db)):
    """
    Delete an employee.
    """
    success = crud.delete_employee(db, employee_id=id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return None
