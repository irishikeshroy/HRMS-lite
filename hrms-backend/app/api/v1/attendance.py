from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import attendance as schemas
from app.crud import attendance as crud
from app.crud.employee import get_employee_by_id

router = APIRouter()

@router.get("/", response_model=schemas.PaginatedAttendanceResponse)
def list_attendance(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=1000, description="Records per page"),
    employee_id: Optional[str] = None,
    query_date: Optional[date] = Query(None, alias="date"),
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status_: Optional[str] = Query(None, alias="status")
) -> schemas.PaginatedAttendanceResponse:
    """Retrieve paginated attendance records."""
    return crud.get_attendance_paginated(
        db, page=page, page_size=page_size,
        employee_id=employee_id, query_date=query_date,
        from_date=from_date, to_date=to_date,
        status=status_
    )

@router.post("/", response_model=schemas.AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(
    attendance_in: schemas.AttendanceCreate,
    db: Session = Depends(get_db)
):
    """
    Mark attendance for an employee.
    """
    # 1. Verify existence of Employee
    employee = get_employee_by_id(db, attendance_in.employee_id)
    if not employee:
        raise HTTPException(status_code=422, detail="Employee does not exist")
        
    # 2. Prevent future dates
    if attendance_in.date > date.today():
        raise HTTPException(status_code=422, detail="Cannot mark attendance for future dates")

    # 3. Check for duplicate marks
    existing = crud.get_attendance_by_employee_and_date(db, attendance_in.employee_id, attendance_in.date)
    if existing:
        raise HTTPException(status_code=409, detail="Attendance already marked for this date")
        
    attendance = crud.create_attendance(db=db, attendance=attendance_in)
    # Enrich response for immediate consistency
    return {
        **attendance.__dict__,
        "employee_code": employee.employee_id,
        "full_name": employee.full_name
    }

@router.patch("/{attendance_id}", response_model=schemas.AttendanceResponse)
def update_attendance_status(
    attendance_id: str,
    update_in: schemas.AttendanceUpdate,
    db: Session = Depends(get_db)
):
    """Update the status of an existing attendance record."""
    db_attendance = crud.get_attendance_by_id(db, attendance_id)
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    res = db_attendance
    if update_in.status:
        res = crud.update_attendance(db, db_attendance, update_in.status)
        
    # Enrich response
    return {
        **res.__dict__,
        "employee_code": res.employee.employee_id,
        "full_name": res.employee.full_name
    }

@router.get("/{emp_id}", response_model=schemas.PaginatedAttendanceResponse)
def get_employee_attendance(
    emp_id: str, 
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated attendance records for a specific employee."""
    return crud.get_attendance_paginated(
        db, page=page, page_size=page_size,
        employee_id=emp_id, from_date=from_date, to_date=to_date,
        status=status
    )
