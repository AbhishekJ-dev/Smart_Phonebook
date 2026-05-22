import axios from 'axios';

// Create high-performance Axios instance targeting the Node API server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically inject authorization JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch global API errors and handle automatic logout for 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 (Unauthorized) and has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear credentials and force reload if unauthorized session expired
      loggerCleanSession();
    }
    
    return Promise.reject(error);
  }
);

const loggerCleanSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Custom event trigger so Context layers know to evict auth instantly
  window.dispatchEvent(new Event('auth-session-expired'));
};

export default api;
