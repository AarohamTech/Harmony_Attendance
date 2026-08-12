import apiClient from './client';
import { Department } from '../types';

export const departmentApi = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get('/admin/departments');
    return response.data.data || response.data;
  },

  createDepartment: async (data: { department_name: string; description?: string; manager_id?: number }): Promise<any> => {
    const response = await apiClient.post('/admin/departments', data);
    return response.data;
  },

  updateDepartment: async (id: number, data: Partial<Department>): Promise<any> => {
    const response = await apiClient.put(`/admin/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/admin/departments/${id}`);
    return response.data;
  },
};
