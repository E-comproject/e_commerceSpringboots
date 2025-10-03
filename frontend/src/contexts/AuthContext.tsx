'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import api from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isSeller: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = authService.getAccessToken();
      console.log('🔑 Access token:', token ? 'exists' : 'missing');

      if (authService.isAuthenticated()) {
        console.log('📡 Fetching user from /me...');
        const response = await api.get<User>('/me');
        console.log('✅ User fetched:', response.data);
        setUser(response.data);
      } else {
        console.log('❌ Not authenticated');
      }
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      // If token is invalid, clear it
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    await fetchUser();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isSeller: user?.role === 'SELLER' || user?.role === 'ROLE_SELLER' || user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
