import { apiClient } from './axios';

export type AttendanceStatus = 'Present' | 'Absent';

export interface Attendance {
    id: string;
    employee_id: string;
    date: string;
    status: AttendanceStatus;
    created_at: string;
}

export interface AttendanceCreate {
    employee_id: string;
    date: string;
    status: AttendanceStatus;
}

export interface DashboardStats {
    total_employees: number;
    present_today: number;
    absent_today: number;
}

export interface TodayAttendanceRecord {
    attendance_id: string;
    employee_code: string;
    full_name: string;
    department: string;
    status: string;
    date: string;
}

export interface PaginatedAttendanceResponse {
    total: number;
    page: number;
    page_size: number;
    items: Attendance[];
}

export const getAttendance = (params?: { employee_id?: string; date?: string; status?: string; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedAttendanceResponse>('/attendance/', { params });

export const getEmployeeAttendance = (empId: string, params?: { from_date?: string; to_date?: string; page?: number; page_size?: number; status?: string }) =>
    apiClient.get<PaginatedAttendanceResponse>(`/attendance/${empId}`, { params });

export const markAttendance = (data: AttendanceCreate) =>
    apiClient.post<Attendance>('/attendance/', data);

export const updateAttendance = (attendanceId: string, data: { status: string }) =>
    apiClient.patch<Attendance>(`/attendance/${attendanceId}`, data);

export const getDashboardStats = () =>
    apiClient.get<DashboardStats>('/dashboard/');

export const getTodayAttendance = () =>
    apiClient.get<TodayAttendanceRecord[]>('/dashboard/today-attendance');
