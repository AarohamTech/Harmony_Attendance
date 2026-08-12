import apiClient from './client';
import { CompanySettings } from '../types';

export const settingsApi = {
  getSettings: async (): Promise<CompanySettings> => {
    const response = await apiClient.get('/admin/settings');
    return response.data.data || response.data;
  },

  updateSettings: async (data: Partial<CompanySettings>): Promise<any> => {
    const response = await apiClient.put('/admin/settings', data);
    return response.data;
  },
};
