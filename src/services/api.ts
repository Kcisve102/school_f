import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.trainflowai.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect to login if on admin page and not authenticated
      if (currentPath === '/admin') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
