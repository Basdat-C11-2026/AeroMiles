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

  // Daftar menu utama untuk masing-masing role
  const memberLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Identitas Saya', href: '/member/identities' },
    { name: 'Klaim Miles', href: '/member/claims' },
    { name: 'Transfer Miles', href: '/member/transfers' },
    { name: 'Redeem Hadiah', href: '/member/redeem' },
    { name: 'Beli Package', href: '/member/packages' },
    { name: 'Info Tier', href: '/member/tiers' },
  ];

  const staffLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Kelola Member', href: '/staff/members' },
    { name: 'Kelola Klaim', href: '/staff/claims' },
    { name: 'Kelola Hadiah', href: '/staff/rewards' },
    { name: 'Kelola Mitra', href: '/staff/partners' },
    { name: 'Laporan Transaksi', href: '/staff/reports' },
  ];

  const navLinks = user?.role === 'staff' ? staffLinks : memberLinks;

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

          {/* Desktop Menu */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link, idx) => (
                <Link key={idx} href={link.href} className="text-white text-sm hover:text-blue-200 transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* User Profile & Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Desktop Profile Dropdown */}
                <div className="hidden lg:flex items-center relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors text-white"
                  >
                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{user.name.charAt(0)}</span>
                    </span>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs font-semibold text-blue-600 uppercase mt-1">
                          {user.role}
                        </p>
                      </div>

                      {user.role === 'member' ? (
                        <>
                          <Link href="/member/identities" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🪪 Identitas Saya</Link>
                          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">⚙️ Pengaturan Profil</Link>
                          <div className="block px-4 py-2 text-sm text-gray-700 bg-blue-50/50">💰 {(user.totalMiles || 0).toLocaleString()} Miles</div>
                        </>
                      ) : (
                        <>
                          <Link href="/staff/members" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">👥 Kelola Member</Link>
                          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">⚙️ Pengaturan Profil</Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden lg:flex gap-3">
                <Link href="/login" className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium">Masuk</Link>
                <Link href="/register" className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">Daftar</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white hover:text-blue-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-1 pt-2 border-t border-blue-500 mt-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-blue-100 mb-2 font-medium">Halo, {user?.name} ({user?.role})</div>
                {navLinks.map((link, idx) => (
                  <Link key={idx} href={link.href} className="block text-white hover:bg-blue-700 px-3 py-2 rounded text-sm">
                    {link.name}
                  </Link>
                ))}

                <div className="border-t border-blue-500 mt-2 pt-2">
                  {user?.role === 'member' ? (
                    <Link href="/member/identities" className="block text-white hover:bg-blue-700 px-3 py-2 rounded text-sm">Identitas Saya</Link>
                  ) : (
                    <Link href="/staff/members" className="block text-white hover:bg-blue-700 px-3 py-2 rounded text-sm">Kelola Member</Link>
                  )}
                  <Link href="/profile" className="block text-white hover:bg-blue-700 px-3 py-2 rounded text-sm">Pengaturan Profil</Link>
                  <button onClick={handleLogout} className="w-full text-left text-red-200 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-white hover:bg-blue-700 px-3 py-2 rounded">Masuk</Link>
                <Link href="/register" className="block text-white hover:bg-blue-700 px-3 py-2 rounded">Daftar</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}