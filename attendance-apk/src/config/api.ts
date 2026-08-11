// Dynamic API Configuration for Harmony AI Attendance Android APK & Web
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && (window as any).API_BASE_URL) ||
  "http://172.20.10.3:8000";

export const getFullApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
