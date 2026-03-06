from fastapi import APIRouter

from app.api.v1.employees import router as employees_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(employees_router, prefix="/employees", tags=["Employees"])
api_router.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
