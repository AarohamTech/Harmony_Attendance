import apiClient from './client';
import { AttendanceRequest } from '../types';

export const leaveApi = {
  getLeaveRequests: async (statusOrParams?: string | { status?: string; type?: string }): Promise<AttendanceRequest[]> => {
    const params = typeof statusOrParams === 'string' ? { status: statusOrParams } : statusOrParams;
    const response = await apiClient.get('/admin/leave-requests', { params });
    return response.data.data || response.data;
  },

  processAction: async (id: number, action: 'Approved' | 'Rejected', remarks?: string): Promise<any> => {
    const response = await apiClient.post(`/admin/leave-requests/${id}/action`, {
      action,
      manager_remark: remarks,
      remarks,
    });
    return response.data;
  },
};
