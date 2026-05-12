'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Gagal login');
      } else {
        // Simpan user ke localStorage jika perlu
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.data));
        }
        // Cek role dan redirect
        if (data.data.role === 'staff') {
          router.push('/staff/dashboard');
        } else {
          router.push('/member/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AM</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AeroMiles</h1>
            <p className="text-gray-600 mt-2">Masuk ke akun Anda</p>
          </div>

          {/* Informasi Cara Login (Simulasi) */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-2">💡 Info Simulasi Login:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-4">
              <li>
                <span className="font-semibold">Sebagai Member:</span> Gunakan email bebas (contoh: <code className="bg-blue-100 px-1 rounded">user@gmail.com</code>).
              </li>
              <li>
                <span className="font-semibold">Sebagai Staf:</span> Gunakan email berakhiran <code className="bg-blue-100 px-1 rounded">@aeromiles.com</code>.
              </li>
            </ul>
            <p className="text-xs text-blue-600 italic mt-2">
              *Password bebas, minimal 6 karakter.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-gray-600">Ingat saya</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Lupa password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}