import apiClient from './client';
import { AttendanceRequest } from '../types';

export const missedPunchApi = {
  getMissedPunchRequests: async (): Promise<AttendanceRequest[]> => {
    const response = await apiClient.get('/admin/requests', {
      params: { type: 'Attendance Correction' },
    });
    return response.data.data || response.data;
  },

  processAction: async (id: number, action: 'Approved' | 'Rejected', remarks?: string): Promise<any> => {
    const response = await apiClient.post(`/admin/requests/${id}/action`, {
      action,
      manager_remark: remarks,
      remarks,
    });
    return response.data;
  },
};
