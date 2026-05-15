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

interface RegisterData extends Partial<User> {
  salutation?: string;
  first_mid_name?: string;
  last_name?: string;
  country_code?: string;
  mobile_number?: string;
  tanggal_lahir?: string;
  kewarganegaraan?: string;
  kode_maskapai?: string; // Khusus staf
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (role: 'member' | 'staff', data: RegisterData) => Promise<void>;
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
      if (!email || !password) throw new Error('Email dan password harus diisi');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat login');
      }

      const isStaff = data.role === 'Staf';

      const loggedInUser: User = {
        id: data.user.email,
        email: data.user.email,

        name: `${data.user.first_mid_name} ${data.user.last_name}`,

        role: isStaff ? 'staff' : 'member',

        phone: `${data.user.country_code} ${data.user.mobile_number}`,

        nationality: data.user.kewarganegaraan,
        birthDate: data.user.tanggal_lahir,

        ...(isStaff
          ? {
            staffId: data.staffData?.id_staf,
            airline: data.staffData?.kode_maskapai,
          }
          : {
            memberNumber: data.memberData?.nomor_member,
            tier: data.memberData?.id_tier,
            totalMiles: data.memberData?.total_miles,
            awardMiles: data.memberData?.award_miles,
            joinDate: data.memberData?.tanggal_bergabung,
          }),
      };
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (role: 'member' | 'staff', data: RegisterData) => {
    setIsLoading(true);
    try {
      const endpoint = role === 'member'
        ? '/api/auth/register/member'
        : '/api/auth/register/staff';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal melakukan registrasi');
      }

    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Gagal memanggil API logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (updatedData: Partial<User>, currentPassword?: string, newPassword?: string) => {
    if (!user) throw new Error('User not logged in');
    await new Promise(resolve => setTimeout(resolve, 800));

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