'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<'member' | 'staff'>('member');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [salutation, setSalutation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('');

  const [kodeMaskapai, setKodeMaskapai] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Email dan Password wajib diisi.');
      return;
    }

    if (!salutation || !firstName || !lastName || !birthDate || !nationality) {
      setError('Mohon lengkapi data profil Anda.');
      return;
    }

    if (role === 'staff' && !kodeMaskapai) {
      setError('Mohon pilih maskapai tempat Anda bekerja.');
      return;
    }

    if (role === 'staff' && !email.endsWith('@aeromiles.com')) {
      setError('Staf wajib menggunakan email @aeromiles.com');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
        salutation,
        first_mid_name: firstName,
        last_name: lastName,
        country_code: countryCode,
        mobile_number: phoneNumber,
        tanggal_lahir: birthDate,
        kewarganegaraan: nationality,
        ...(role === 'staff' && { kode_maskapai: kodeMaskapai })
      };

      await register(role, payload);
      
      alert('Registrasi berhasil! Silakan login.');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          
          <div className="text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AM</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Registrasi AeroMiles</h1>
            <p className="text-gray-600 mt-2">Daftar sebagai {role === 'member' ? 'Member' : 'Staf'}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <button 
              type="button"
              onClick={() => setRole('member')}
              className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${role === 'member' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              👥 Saya Ingin Jadi Member
            </button>
            <button 
              type="button"
              onClick={() => {
                setRole('staff');
                if(!email.includes('@')) setEmail('@aeromiles.com');
              }}
              className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${role === 'staff' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              👔 Saya Adalah Staf
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* DATA PROFIL (GABUNGAN) */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Informasi Profil Pribadi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salutation</label>
                  <select 
                    value={salutation} 
                    onChange={(e) => setSalutation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Pilih...</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: Indonesia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Depan & Tengah</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Handphone</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none text-center"
                    />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="812345678"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* KHUSUS STAF: PILIH MASKAPAI */}
              {role === 'staff' && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asal Maskapai</label>
                  <select 
                    value={kodeMaskapai} 
                    onChange={(e) => setKodeMaskapai(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Pilih Maskapai...</option>
                    <option value="GA">Garuda Indonesia (GA)</option>
                    <option value="QZ">Citilink (QZ)</option>
                    <option value="JT">Lion Air (JT)</option>
                    <option value="ID">Batik Air (ID)</option>
                    <option value="SQ">Singapore Airlines (SQ)</option>
                  </select>
                </div>
              )}
            </div>

            {/* KREDENSIAL LOGIN */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Kredensial Akun</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={role === 'staff' ? "nama@aeromiles.com" : "email@example.com"}
                />
                {role === 'staff' && (
                  <p className="text-xs text-blue-600 mt-1">Gunakan email perusahaan (@aeromiles.com)</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : `Daftar sebagai ${role === 'staff' ? 'Staf' : 'Member'}`}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}