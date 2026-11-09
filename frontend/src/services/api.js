import axios from 'axios';

/**
 * StudyOS Central Axios Client
 * Base URL targets the versioned Laravel REST API (/api/v1).
 * Uses stateless Sanctum Bearer tokens (withCredentials: false).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Stateless Bearer token mode (avoids CSRF mismatches)
  timeout: 15000,
});

// Request Interceptor: Attach Sanctum Bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyos_token');
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error handling and handle 401 unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('studyos_token');
        localStorage.removeItem('studyos_user');
        // Do not force reload; react state will react to null user
      }
      return Promise.reject(error.response.data || error.response);
    } else if (error.request) {
      return Promise.reject({
        message: 'Cannot reach the StudyOS API server. Check if Laravel is running on port 8000.',
      });
    }
    return Promise.reject({ message: error.message });
  }
);

export default api;
