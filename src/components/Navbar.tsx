'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">AM</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:inline">AeroMiles</span>
          </Link>

          {/* Desktop Menu - Only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white hover:text-blue-100 transition-colors">
                Dashboard
              </Link>
              <a href="#" className="text-white hover:text-blue-100 transition-colors">
                Penerbangan
              </a>
              <a href="#" className="text-white hover:text-blue-100 transition-colors">
                Rewards
              </a>
              <a href="#" className="text-white hover:text-blue-100 transition-colors">
                Transaksi
              </a>
            </div>
          )}

          {/* User Profile & Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Desktop Profile */}
                <div className="hidden md:flex items-center relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors text-white"
                  >
                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{user.name.charAt(0)}</span>
                    </span>
                    <span className="text-sm font-medium">{user.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        ⭐ Profil Saya
                      </a>
                      <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        ⚙️ Pengaturan
                      </a>
                      <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        💰 Miles: {user.milesBalance.toLocaleString()}
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Daftar
                  </Link>
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link href="/" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Dashboard
                </Link>
                <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Penerbangan
                </a>
                <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Rewards
                </a>
                <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Transaksi
                </a>
                <div className="border-t border-blue-500 mt-2 pt-2">
                  <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                    ⭐ Profil
                  </a>
                  <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                    ⚙️ Pengaturan
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors font-medium"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors font-medium"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
