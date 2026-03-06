from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate
from typing import List, Optional

def get_employee_by_id(db: Session, employee_id: str) -> Optional[Employee]:
    return db.query(Employee).filter(Employee.id == employee_id).first()

def get_employee_by_emp_code(db: Session, emp_code: str) -> Optional[Employee]:
    return db.query(Employee).filter(Employee.employee_id == emp_code).first()

def get_employee_by_email(db: Session, email: str) -> Optional[Employee]:
    return db.query(Employee).filter(Employee.email == email).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, department: Optional[str] = None) -> List[Employee]:
    query = db.query(Employee)
    if search:
        query = query.filter(Employee.full_name.ilike(f"%{search}%") | Employee.employee_id.ilike(f"%{search}%"))
    if department:
        query = query.filter(Employee.department == department)
    return query.offset(skip).limit(limit).all()

def get_employees_paginated(db: Session, page: int = 1, page_size: int = 10, search: Optional[str] = None, department: Optional[str] = None) -> dict:
    """Return paginated employees with total count."""
    query = db.query(Employee).order_by(Employee.created_at.desc())
    if search:
        query = query.filter(Employee.full_name.ilike(f"%{search}%") | Employee.employee_id.ilike(f"%{search}%"))
    if department:
        query = query.filter(Employee.department == department)
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "page": page, "page_size": page_size, "items": items}

def create_employee(db: Session, employee: EmployeeCreate) -> Employee:
    db_employee = Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department=employee.department
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: str):
    db_employee = get_employee_by_id(db, employee_id)
    if db_employee:
        db.delete(db_employee)
        db.commit()
        return True
    return False

