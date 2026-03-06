import { apiClient } from './axios';

export interface Employee {
    id: string;
    employee_id: string;
    full_name: string;
    email: string;
    department: string;
    created_at: string;
}

export interface EmployeeCreate {
    employee_id: string;
    full_name: string;
    email: string;
    department: string;
}

export interface PaginatedEmployeeResponse {
    total: number;
    page: number;
    page_size: number;
    items: Employee[];
}

export const getEmployees = (params?: { search?: string; department?: string; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedEmployeeResponse>('/employees/', { params });

export const getEmployee = (id: string) =>
    apiClient.get<Employee>(`/employees/${id}`);

export const createEmployee = (data: EmployeeCreate) =>
    apiClient.post<Employee>('/employees/', data);

export const deleteEmployee = (id: string) =>
    apiClient.delete(`/employees/${id}`);
