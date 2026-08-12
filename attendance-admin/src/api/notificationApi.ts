import apiClient from './client';
import { NotificationItem } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await apiClient.get('/notifications');
    return response.data.data || response.data;
  },

  markRead: async (id: number): Promise<any> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<any> => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },
};
