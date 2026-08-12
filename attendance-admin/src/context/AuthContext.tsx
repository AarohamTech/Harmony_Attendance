import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, AuthState } from '../types';
import { getStoredToken, getStoredUser, setAuthStorage, clearAuthStorage, isAdminUser } from '../utils/auth';
import { authApi } from '../api/authApi';

interface AuthContextType extends AuthState {
  login: (token: string, user: Employee) => void;
  logout: () => void;
  updateUser: (user: Employee) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: getStoredToken(),
    user: getStoredUser(),
    isAuthenticated: !!getStoredToken(),
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setAuthState({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      try {
        const user = await authApi.getMe();
        if (isAdminUser(user)) {
          setAuthStorage(token, user);
          setAuthState({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          clearAuthStorage();
          setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (err) {
        // Fall back to local user if API temporary error, or clear if 401
        const cachedUser = getStoredUser();
        if (cachedUser && isAdminUser(cachedUser)) {
          setAuthState({
            token,
            user: cachedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          clearAuthStorage();
          setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    initAuth();
  }, []);

  const login = (token: string, user: Employee) => {
    setAuthStorage(token, user);
    setAuthState({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    authApi.logout();
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (user: Employee) => {
    const token = getStoredToken();
    if (token) {
      setAuthStorage(token, user);
    }
    setAuthState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
