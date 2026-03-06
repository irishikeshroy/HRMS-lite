from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import func
from typing import List, Optional

from app.models.attendance import Attendance
from app.models.employee import Employee
from app.schemas.attendance import AttendanceCreate
from app.schemas.employee import DashboardStats, TodayAttendanceRecord

def get_attendance(db: Session, skip: int = 0, limit: int = 100,
                   employee_id: Optional[str] = None, 
                   query_date: Optional[date] = None,
                   status: Optional[str] = None) -> List[Attendance]:
    query = db.query(Attendance)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if query_date:
        query = query.filter(Attendance.date == query_date)
    if status:
        query = query.filter(Attendance.status == status)
    return query.offset(skip).limit(limit).all()

def get_attendance_paginated(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    employee_id: Optional[str] = None,
    query_date: Optional[date] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status: Optional[str] = None,
) -> dict:
    """Return paginated attendance records with total count."""
    query = db.query(Attendance).order_by(Attendance.date.desc(), Attendance.created_at.desc())
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if query_date:
        query = query.filter(Attendance.date == query_date)
    if from_date:
        query = query.filter(Attendance.date >= from_date)
    if to_date:
        query = query.filter(Attendance.date <= to_date)
    if status:
        query = query.filter(Attendance.status == status)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "page": page, "page_size": page_size, "items": items}

def create_attendance(db: Session, attendance: AttendanceCreate) -> Attendance:
    db_attendance = Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=attendance.status
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance_by_employee_and_date(db: Session, employee_id: str, query_date: date) -> Optional[Attendance]:
    return db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date == query_date
    ).first()

def get_attendance_by_id(db: Session, id: str) -> Optional[Attendance]:
    return db.query(Attendance).filter(Attendance.id == id).first()

def update_attendance(db: Session, db_attendance: Attendance, status: str) -> Attendance:
    db_attendance.status = status
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_dashboard_stats(db: Session) -> DashboardStats:
    today = date.today()
    
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    present_today = db.query(func.count(Attendance.id)).filter(
        Attendance.date == today,
        Attendance.status == 'Present'
    ).scalar() or 0
    
    absent_today = db.query(func.count(Attendance.id)).filter(
        Attendance.date == today,
        Attendance.status == 'Absent'
    ).scalar() or 0
    
    return DashboardStats(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today
    )

def get_today_attendance_enriched(db: Session) -> List[TodayAttendanceRecord]:
    """Return today's attendance records joined with employee info."""
    today = date.today()
    rows = (
        db.query(Attendance, Employee)
        .join(Employee, Attendance.employee_id == Employee.id)
        .filter(Attendance.date == today)
        .order_by(Attendance.created_at.desc())
        .all()
    )
    return [
        TodayAttendanceRecord(
            attendance_id=str(att.id),
            employee_code=emp.employee_id,
            full_name=emp.full_name,
            department=emp.department,
            status=att.status,
            date=str(att.date),
        )
        for att, emp in rows
    ]
