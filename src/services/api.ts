import axios from 'axios';
import { API_BASE_URL } from '../config/BaseUrl';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the components handle 401 errors instead of automatically redirecting
    // This prevents logging out users during file uploads or temporary network issues
    return Promise.reject(error);
  }
);

export default api;
