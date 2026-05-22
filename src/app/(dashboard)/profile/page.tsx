'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PengaturanProfil() {
  const { user, updateProfile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profil' | 'password'>('profil');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [airline, setAirline] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Mengisi form dengan data saat ini
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setNationality(user.nationality);
      setBirthDate(user.birthDate);
      if (user.role === 'staff' && user.airline) {
        setAirline(user.airline);
      }
    }
  }, [user]);

  if (isLoading || !user) return <div className="p-8 text-center">Memuat...</div>;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (!name || !phone || !nationality || !birthDate) {
        throw new Error("Semua field profil wajib diisi.");
      }

      const updateData: any = { name, phone, nationality, birthDate };
      if (user.role === 'staff') updateData.airline = airline;

      await updateProfile(updateData);
      setSuccessMsg('Profil berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Semua field password wajib diisi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Password baru dan konfirmasi tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password baru minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({}, currentPassword, newPassword);
      setSuccessMsg('Password berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-900">Pengaturan Profil</h1>
          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded uppercase font-bold">
            {user.role}
          </span>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('profil'); setSuccessMsg(''); setErrorMsg(''); }}
            className={`flex-1 py-3 text-sm font-medium text-center ${activeTab === 'profil' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Data Pribadi
          </button>
          <button
            onClick={() => { setActiveTab('password'); setSuccessMsg(''); setErrorMsg(''); }}
            className={`flex-1 py-3 text-sm font-medium text-center ${activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ubah Password
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">{successMsg}</div>}
          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">{errorMsg}</div>}

          {/* TAB PROFIL */}
          {activeTab === 'profil' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              {/* Field yang tidak bisa diubah */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Data Tidak Dapat Diubah</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Email Terdaftar</label>
                    <input type="text" disabled value={user.email} className="mt-1 w-full bg-gray-200 text-gray-600 px-3 py-2 rounded-md border border-gray-300 cursor-not-allowed" />
                  </div>
                  
                  {user.role === 'member' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Nomor Member</label>
                        <input type="text" disabled value={user.memberNumber} className="mt-1 w-full bg-gray-200 text-gray-600 px-3 py-2 rounded-md border border-gray-300 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Tanggal Bergabung</label>
                        <input type="text" disabled value={user.joinDate} className="mt-1 w-full bg-gray-200 text-gray-600 px-3 py-2 rounded-md border border-gray-300 cursor-not-allowed" />
                      </div>
                    </>
                  )}

                  {user.role === 'staff' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">ID Staf</label>
                      <input type="text" disabled value={user.staffId} className="mt-1 w-full bg-gray-200 text-gray-600 px-3 py-2 rounded-md border border-gray-300 cursor-not-allowed" />
                    </div>
                  )}
                </div>
              </div>

              {/* Field yang bisa diubah */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap (Termasuk Salutation)</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nomor HP (Beserta Kode Negara)</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kewarganegaraan</label>
                    <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                {/* Khusus Staf: Maskapai */}
                {user.role === 'staff' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maskapai Tempat Bertugas</label>
                    <input type="text" value={airline} onChange={(e) => setAirline(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}

          {/* TAB PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password Lama</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50">
                  {isSubmitting ? 'Memproses...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}