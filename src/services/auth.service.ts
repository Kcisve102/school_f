import api from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  signup: async (email: string, password: string, full_name: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/signup', {
      email,
      password,
      full_name,
    });
    return response.data.data!;
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  checkAuth: async (): Promise<{ authenticated: boolean; isAdmin: boolean }> => {
    const response = await api.get<ApiResponse<{ authenticated: boolean; isAdmin: boolean }>>('/auth/check');
    return response.data.data!;
  },
};

export default authService;
