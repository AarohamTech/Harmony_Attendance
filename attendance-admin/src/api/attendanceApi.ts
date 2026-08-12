import apiClient from './client';
import { AttendanceRecord, DashboardStats, DashboardCharts } from '../types';

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const attendanceApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data.stats;
    } catch (e) {
      // Fallback to overview if stats endpoint isn't loaded
      const res = await apiClient.get('/api/dashboard/overview');
      const kpis = res.data.kpis || {};
      return {
        totalEmployees: kpis.totalEmployees || 0,
        presentToday: kpis.todayPresent || 0,
        absentToday: (kpis.totalEmployees || 0) - (kpis.todayPresent || 0),
        lateToday: kpis.lateCount || 0,
        onLeaveToday: 0,
        pendingLeaveRequests: kpis.approvalsPending || 0,
        currentlyPunchedIn: kpis.todayPresent || 0,
      };
    }
  },

  getDashboardCharts: async (): Promise<DashboardCharts> => {
    const response = await apiClient.get('/admin/dashboard/charts');
    return response.data;
  },

  getAttendanceRecords: async (params?: {
    page?: number;
    limit?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    employee_id?: number | string;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<AttendanceResponse> => {
    const response = await apiClient.get<AttendanceResponse>('/admin/attendance', { params });
    return response.data;
  },

  getPunchRecords: async (params?: {
    page?: number;
    limit?: number;
    date?: string;
    search?: string;
  }): Promise<AttendanceResponse> => {
    const response = await apiClient.get<AttendanceResponse>('/admin/punch-records', { params });
    return response.data;
  },
};
