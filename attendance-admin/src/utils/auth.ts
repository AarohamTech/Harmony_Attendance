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

export const isAdminUser = (user: Employee | null): boolean => {
  if (!user || !user.role) return false;
  const roleStr = user.role.trim().toLowerCase();
  return roleStr === 'admin' || roleStr === 'hr' || roleStr === 'manager';
};
