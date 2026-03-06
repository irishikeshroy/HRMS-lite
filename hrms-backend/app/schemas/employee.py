from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# Shared properties
class EmployeeBase(BaseModel):
    employee_id: str = Field(..., max_length=20, example="EMP001")
    full_name: str = Field(..., max_length=100, example="John Doe")
    email: EmailStr
    department: str = Field(..., max_length=80, example="Engineering")

# Properties to receive on item creation
class EmployeeCreate(EmployeeBase):
    pass

# Properties to return to client
class EmployeeResponse(EmployeeBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int

class TodayAttendanceRecord(BaseModel):
    attendance_id: str
    employee_code: str
    full_name: str
    department: str
    status: str
    date: str

class PaginatedEmployeeResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[EmployeeResponse]
