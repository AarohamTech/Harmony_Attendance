import apiClient from './client';
import { Employee } from '../types';

export interface EmployeesResponse {
  success: boolean;
  data: Employee[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const employeeApi = {
  getEmployees: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  }): Promise<EmployeesResponse> => {
    const response = await apiClient.get<EmployeesResponse>('/admin/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id: string | number): Promise<any> => {
    const response = await apiClient.get(`/admin/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data: Partial<Employee> & { password?: string }): Promise<any> => {
    const response = await apiClient.post('/admin/employees', data);
    return response.data;
  },

  updateEmployee: async (id: number | string, data: Partial<Employee> & { password?: string }): Promise<any> => {
    const response = await apiClient.put(`/admin/employees/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: number | string, status: 'Active' | 'Inactive'): Promise<any> => {
    const response = await apiClient.patch(`/admin/employees/${id}/status`, { status });
    return response.data;
  },

  deleteEmployee: async (id: number | string): Promise<any> => {
    const response = await apiClient.delete(`/admin/employees/${id}`);
    return response.data;
  },

  getAdminUsers: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/admin/admin-users');
    return response.data.data || response.data;
  },
};
