import apiClient from './client';
import { Employee } from '../types';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  access_token?: string;
  employee: Employee;
}

export const authApi = {
  login: async (credential: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      credential,
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<Employee> => {
    const response = await apiClient.get('/auth/me');
    return response.data.employee || response.data.data || response.data;
  },

  register: async (payload: Record<string, any>): Promise<any> => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  registerEmployee: async (payload: Record<string, any>): Promise<any> => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  registerAdmin: async (payload: Record<string, any>): Promise<any> => {
    const response = await apiClient.post('/admin/employees', payload);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (e) {
      // Return consistent success message to prevent account enumeration vulnerabilities
      return {
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('harmony_admin_token');
      localStorage.removeItem('harmony_admin_user');
    }
  },
};
