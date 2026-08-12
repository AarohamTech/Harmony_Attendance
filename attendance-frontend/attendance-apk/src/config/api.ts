// Dynamic API Configuration for Harmony AI Attendance Android APK & Web
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://harmony-attendance-backend.vercel.app"
).replace(/\/+$/, '');

export const getFullApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
