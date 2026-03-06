from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Optional

from app.models.attendance import AttendanceStatus

class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None

class AttendanceResponse(AttendanceBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class PaginatedAttendanceResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[AttendanceResponse]
