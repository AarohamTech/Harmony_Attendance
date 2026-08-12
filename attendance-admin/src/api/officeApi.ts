import apiClient from './client';
import { OfficeLocation } from '../types';

export const officeApi = {
  getOffices: async (): Promise<OfficeLocation[]> => {
    const response = await apiClient.get('/admin/offices');
    return response.data.data || response.data;
  },

  createOffice: async (data: Omit<OfficeLocation, 'office_id'>): Promise<any> => {
    const response = await apiClient.post('/admin/offices', data);
    return response.data;
  },

  updateOffice: async (id: number, data: Partial<OfficeLocation>): Promise<any> => {
    const response = await apiClient.put(`/admin/offices/${id}`, data);
    return response.data;
  },

  deleteOffice: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/admin/offices/${id}`);
    return response.data;
  },
};
