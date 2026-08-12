import apiClient from './client';
import { Holiday } from '../types';

export const holidayApi = {
  getHolidays: async (): Promise<Holiday[]> => {
    const response = await apiClient.get('/admin/holidays');
    return response.data.data || response.data;
  },

  createHoliday: async (data: { holiday_name: string; holiday_date: string; holiday_type?: string }): Promise<any> => {
    const response = await apiClient.post('/admin/holidays', data);
    return response.data;
  },

  updateHoliday: async (id: number, data: Partial<Holiday>): Promise<any> => {
    const response = await apiClient.put(`/admin/holidays/${id}`, data);
    return response.data;
  },

  deleteHoliday: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/admin/holidays/${id}`);
    return response.data;
  },
};
