import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { API_ROUTES } from '../constants/apiRoutes';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studyos_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('studyos_token'));
  const [initialLoading, setInitialLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate or refresh session on app startup
  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('studyos_token');
    if (!storedToken) {
      setInitialLoading(false);
      return;
    }

    try {
      const res = await api.get(API_ROUTES.AUTH.ME);
      const userData = res.user || res.data || res;
      setUser(userData);
      localStorage.setItem('studyos_user', JSON.stringify(userData));
    } catch (err) {
      console.warn('Failed to restore session:', err);
      localStorage.removeItem('studyos_token');
      localStorage.removeItem('studyos_user');
      setToken(null);
      setUser(null);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post(API_ROUTES.AUTH.LOGIN, { email, password });
      const userToken = res.token;
      const userData = res.user || res.data;

      localStorage.setItem('studyos_token', userToken);
      localStorage.setItem('studyos_user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const message =
        err.message ||
        err.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Authentication failed.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.post(API_ROUTES.AUTH.REGISTER, userData);
      const userToken = res.token;
      const userObj = res.user || res.data;

      localStorage.setItem('studyos_token', userToken);
      localStorage.setItem('studyos_user', JSON.stringify(userObj));

      setToken(userToken);
      setUser(userObj);

      return userObj;
    } catch (err) {
      const message =
        err.message ||
        Object.values(err.errors || {})[0]?.[0] ||
        'Registration failed.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT);
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('studyos_token');
      localStorage.removeItem('studyos_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading: initialLoading,
        error: authError,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
