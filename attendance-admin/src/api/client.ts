import axios from 'axios';

// Get API base URL with fallback to window.location origin in local dev if needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://harmony-attendance-backend.vercel.app';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('harmony_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Auto-logout on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and trigger auth logout event if on an admin route
      localStorage.removeItem('harmony_admin_token');
      localStorage.removeItem('harmony_admin_user');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
