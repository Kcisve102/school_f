import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { User, AuthContextType } from '../types';
import toast from 'react-hot-toast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const authStatus = await authService.checkAuth();
      if (authStatus.authenticated) {
        const userData = await authService.getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      toast.success('Logged in successfully!');
      return userData;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const signup = async (email: string, password: string, full_name: string) => {
    try {
      const userData = await authService.signup(email, password, full_name);
      setUser(userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
