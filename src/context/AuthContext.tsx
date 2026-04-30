'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Tambahkan role pada interface User
interface User {
  id: string;
  email: string;
  name: string;
  milesBalance: number;
  role: 'member' | 'staff'; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!email || !password) throw new Error('Email dan password harus diisi');

      // 2. Tentukan Role berdasarkan domain email
      const isStaff = email.endsWith('@aeromiles.com');

      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        milesBalance: isStaff ? 0 : 245850, // Staf tidak butuh miles
        role: isStaff ? 'staff' : 'member',
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!name || !email || !password) throw new Error('Semua field harus diisi');
      if (password.length < 6) throw new Error('Password minimal 6 karakter');

      const isStaff = email.endsWith('@aeromiles.com');

      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        milesBalance: 0,
        role: isStaff ? 'staff' : 'member',
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}