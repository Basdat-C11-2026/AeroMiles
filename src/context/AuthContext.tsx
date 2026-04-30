'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string; 
  role: 'member' | 'staff';
  phone: string; 
  nationality: string;
  birthDate: string;
  
  // Spesifik Member
  memberNumber?: string;
  tier?: string;
  totalMiles?: number;
  awardMiles?: number;
  joinDate?: string;

  // Spesifik Staf
  staffId?: string;
  airline?: string;
  
  
  password?: string; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>, currentPassword?: string, newPassword?: string) => Promise<void>;
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

      const isStaff = email.endsWith('@aeromiles.com');

      const mockUser: User = {
        id: Date.now().toString(),
        email,
        password: password, 
        name: isStaff ? `Mr. Staff ${email.split('@')[0]}` : 'Mr. John Doe',
        role: isStaff ? 'staff' : 'member',
        phone: '+62 81234567890',
        nationality: 'Indonesia',
        birthDate: '1990-01-15',
        ...(isStaff
          ? {
              staffId: 'STF-00123',
              airline: 'Garuda Indonesia',
            }
          : {
              memberNumber: 'AM-98765432',
              tier: 'Gold',
              totalMiles: 245850,
              awardMiles: 150000,
              joinDate: '2022-05-20',
            }),
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

      const existingEmails = ['admin@aeromiles.com', 'member@test.com'];
      if (existingEmails.includes(email.toLowerCase())) {
        throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Fungsi Update Profil Baru
  const updateProfile = async (updatedData: Partial<User>, currentPassword?: string, newPassword?: string) => {
    if (!user) throw new Error('User not logged in');

    await new Promise(resolve => setTimeout(resolve, 800)); // Simulasi API call

    // Simulasi ganti password
    if (currentPassword && newPassword) {
      if (user.password !== currentPassword) {
        throw new Error('Password lama tidak sesuai.');
      }
      updatedData.password = newPassword;
    }

    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}