'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">AM</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:inline">AeroMiles</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white hover:text-blue-100 transition-colors">
              Dashboard
            </a>
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

          {/* User Profile & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors text-white">
              <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">U</span>
              </span>
              <span className="text-sm font-medium">John Doe</span>
            </button>

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
            <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
              Dashboard
            </a>
            <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
              Penerbangan
            </a>
            <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
              Rewards
            </a>
            <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
              Transaksi
            </a>
            <button className="w-full text-left text-white hover:bg-blue-700 px-3 py-2 rounded transition-colors">
              Profile
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
