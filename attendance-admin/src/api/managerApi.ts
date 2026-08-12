import apiClient from './client';
import { Manager } from '../types';

export const managerApi = {
  getManagers: async (): Promise<Manager[]> => {
    const response = await apiClient.get('/admin/managers');
    return response.data.data || response.data;
  },

  createManager: async (data: any): Promise<any> => {
    const response = await apiClient.post('/admin/managers', data);
    return response.data;
  },

  updateManager: async (id: number, data: any): Promise<any> => {
    const response = await apiClient.put(`/admin/managers/${id}`, data);
    return response.data;
  },

  deleteManager: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/admin/managers/${id}`);
    return response.data;
  },
};
