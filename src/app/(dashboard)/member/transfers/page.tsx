'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Transfer {
  id: string; 
  timestamp: string;
  namaLain: string;
  emailLain: string;
  jumlahMiles: number;
  catatan: string;
  tipe: 'Kirim' | 'Terima';
}

export default function TransferMiles() {
  const { user, updateProfile } = useAuth();
  
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [filterTipe, setFilterTipe] = useState<string>('Semua');

  const [formData, setFormData] = useState({
    emailPenerima: '',
    jumlahMiles: '',
    catatan: '',
  });

  const [error, setError] = useState('');

  const currentMiles = user?.awardMiles || 0;

  const fetchTransfers = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/member/transfers?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const rawData = await res.json();
        const mappedData: Transfer[] = rawData.map((t: any, idx: number) => {
          const isSender = t.email_member_1 === user.email;
          return {
            id: `${t.timestamp}-${idx}`,
            timestamp: new Date(t.timestamp).toLocaleString('id-ID'),
            namaLain: isSender ? t.nama_penerima : t.nama_pengirim,
            emailLain: isSender ? t.email_member_2 : t.email_member_1,
            jumlahMiles: t.jumlah,
            catatan: t.catatan,
            tipe: isSender ? 'Kirim' : 'Terima'
          };
        });
        setTransfers(mappedData);
      }
    } catch (err) {
      console.error("Gagal mengambil data transfer", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'member') {
      fetchTransfers();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.emailPenerima.includes('@')) {
      setError('Email penerima tidak valid'); return;
    }
    const miles = parseInt(formData.jumlahMiles);
    if (isNaN(miles) || miles <= 0) {
      setError('Jumlah miles harus lebih besar dari 0'); return;
    }
    if (miles > currentMiles) {
      setError('Award miles Anda tidak cukup'); return;
    }
    if (formData.emailPenerima === user.email) {
      setError('Anda tidak dapat mentransfer miles ke diri sendiri'); return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/member/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_pengirim: user.email,
          email_penerima: formData.emailPenerima,
          jumlah: miles,
          catatan: formData.catatan
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await updateProfile({ awardMiles: currentMiles - miles });
      
      await fetchTransfers();

      setFormData({ emailPenerima: '', jumlahMiles: '', catatan: '' });
      setShowForm(false);
      setError('');
      alert(data.message);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTransfers = filterTipe === 'Semua' ? transfers : transfers.filter((t) => t.tipe === filterTipe);
  const getTipeColor = (tipe: string) => tipe === 'Kirim' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300';
  const getTipeIcon = (tipe: string) => tipe === 'Kirim' ? '📤' : '📥';

  const sentCount = transfers.filter((t) => t.tipe === 'Kirim').length;
  const receivedCount = transfers.filter((t) => t.tipe === 'Terima').length;
  const sentMiles = transfers.filter((t) => t.tipe === 'Kirim').reduce((sum, t) => sum + t.jumlahMiles, 0);
  const receivedMiles = transfers.filter((t) => t.tipe === 'Terima').reduce((sum, t) => sum + t.jumlahMiles, 0);

  // Access Guard
  if (user?.role !== 'member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full border-t-4 border-red-500">
          <span className="text-4xl mb-4 block">🚫</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Maaf, halaman ini hanya dapat diakses oleh Member AeroMiles.</p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔄 Transfer Miles Antar Member</h1>
            <p className="text-gray-600">Kirim atau terima miles dari member lain</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-600 font-medium mb-2">Award Miles Anda</h3>
              <p className="text-3xl font-bold text-blue-600">{currentMiles.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <h3 className="text-gray-600 font-medium mb-2">Total Dikirim</h3>
              <p className="text-xl font-bold text-red-600">{sentMiles.toLocaleString('id-ID')}</p>
              <p className="text-xs text-gray-600 mt-1">{sentCount} transaksi</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-gray-600 font-medium mb-2">Total Diterima</h3>
              <p className="text-xl font-bold text-green-600">{receivedMiles.toLocaleString('id-ID')}</p>
              <p className="text-xs text-gray-600 mt-1">{receivedCount} transaksi</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <h3 className="text-gray-600 font-medium mb-2">Total Transfer</h3>
              <p className="text-3xl font-bold text-purple-600">{transfers.length}</p>
            </div>
          </div>

          {/* Action Button and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <button
              onClick={() => { setShowForm(!showForm); setError(''); }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              {showForm ? '− Tutup Form' : '+ Buat Transfer Baru'}
            </button>

            {/* Filter Tipe */}
            <div className="flex gap-2 flex-wrap">
              {['Semua', 'Kirim', 'Terima'].map((tipe) => (
                <button
                  key={tipe}
                  onClick={() => setFilterTipe(tipe)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filterTipe === tipe ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tipe}
                </button>
              ))}
            </div>
          </div>

          {/* Form Section */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Buat Transfer Miles</h2>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">⚠️ {error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Member Penerima</label>
                  <input type="email" name="emailPenerima" placeholder="Masukkan email penerima yang terdaftar" value={formData.emailPenerima} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={isProcessing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Miles</label>
                  <input type="number" name="jumlahMiles" placeholder="Contoh: 5000" min="1" value={formData.jumlahMiles} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={isProcessing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Miles Tersedia</label>
                  <input type="text" value={currentMiles.toLocaleString('id-ID')} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                  <textarea name="catatan" placeholder="Tambahkan catatan untuk penerima..." value={formData.catatan} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isProcessing} />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <button type="submit" disabled={isProcessing} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50">
                    {isProcessing ? '⏳ Memproses Transfer...' : '✅ Konfirmasi Transfer'}
                  </button>
                  <button type="button" disabled={isProcessing} onClick={() => { setShowForm(false); setError(''); }} className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200 disabled:opacity-50">
                    ❌ Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Transfers History */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Transfer ({filteredTransfers.length})</h2>
            </div>
            
            {isLoading ? (
               <div className="p-12 text-center text-gray-500">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                 <p>Memuat data transfer...</p>
               </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Belum ada transfer pada kategori ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Detail Pihak Lain</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipe</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 text-right">Jumlah Miles</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.map((transfer) => (
                      <tr key={transfer.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-xs text-gray-500">{transfer.timestamp}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{transfer.namaLain}</p>
                          <p className="text-xs text-gray-500">{transfer.emailLain}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTipeColor(transfer.tipe)}`}>
                            {getTipeIcon(transfer.tipe)} {transfer.tipe}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${transfer.tipe === 'Kirim' ? 'text-red-600' : 'text-green-600'}`}>
                            {transfer.tipe === 'Kirim' ? '-' : '+'} {transfer.jumlahMiles.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 italic max-w-xs truncate" title={transfer.catatan}>{transfer.catatan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">ℹ️ Informasi Penting</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Transfer miles bersifat permanen dan tidak dapat dibatalkan</li>
              <li>• Anda tidak dapat mentransfer miles ke diri sendiri</li>
              <li>• Penerima harus terdaftar sebagai Member aktif dalam sistem</li>
              <li>• Riwayat transfer dapat dilihat oleh kedua pihak (pengirim dan penerima)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}