import { Employee } from '../types';

export const getStoredToken = (): string | null => {
  return localStorage.getItem('harmony_admin_token');
};

export const getStoredUser = (): Employee | null => {
  const userStr = localStorage.getItem('harmony_admin_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const setAuthStorage = (token: string, user: Employee): void => {
  localStorage.setItem('harmony_admin_token', token);
  localStorage.setItem('harmony_admin_user', JSON.stringify(user));
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem('harmony_admin_token');
  localStorage.removeItem('harmony_admin_user');
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload && typeof payload.exp === 'number') {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

export const isAdminUser = (user: Employee | null): boolean => {
  if (!user || !user.role) return false;
  const roleStr = user.role.trim().toLowerCase();
  return roleStr === 'admin' || roleStr === 'hr' || roleStr === 'manager';
};
