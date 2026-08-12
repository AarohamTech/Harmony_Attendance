import apiClient from './client';

export const reportsApi = {
  getReportData: async (params: {
    report_type?: string;
    start_date?: string;
    end_date?: string;
    department?: string;
    employee_id?: string;
  }): Promise<any> => {
    const response = await apiClient.get('/admin/reports/data', { params });
    return response.data;
  },

  exportReport: async (format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
    const response = await apiClient.get('/reports/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
