'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Transfer {
  id: number;
  timestamp: string;
  namaLain: string;
  emailLain: string;
  jumlahMiles: number;
  catatan: string;
  tipe: 'Kirim' | 'Terima';
}

export default function TransferMiles() {
  const { user } = useAuth();
  
  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: 1,
      timestamp: '2026-04-20 15:30',
      namaLain: 'Jane Smith',
      emailLain: 'jane@example.com',
      jumlahMiles: 5000,
      catatan: 'Untuk liburan',
      tipe: 'Kirim',
    },
    {
      id: 2,
      timestamp: '2026-04-18 10:15',
      namaLain: 'Robert Johnson',
      emailLain: 'robert@example.com',
      jumlahMiles: 2500,
      catatan: 'Hadiah dari teman',
      tipe: 'Terima',
    },
    {
      id: 3,
      timestamp: '2026-04-15 14:45',
      namaLain: 'Sarah Williams',
      emailLain: 'sarah@example.com',
      jumlahMiles: 3000,
      catatan: 'Bantuan miles',
      tipe: 'Kirim',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterTipe, setFilterTipe] = useState<string>('Semua');
  const [currentMiles, setCurrentMiles] = useState(35000); // Dummy award miles

  const [formData, setFormData] = useState({
    emailPenerima: '',
    jumlahMiles: '',
    catatan: '',
  });

  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.emailPenerima.includes('@')) {
      setError('Email penerima tidak valid');
      return;
    }

    const miles = parseInt(formData.jumlahMiles);
    if (isNaN(miles) || miles <= 0) {
      setError('Jumlah miles harus lebih besar dari 0');
      return;
    }

    if (miles > currentMiles) {
      setError('Award miles Anda tidak cukup');
      return;
    }

    if (formData.emailPenerima === 'john@example.com') {
      setError('Anda tidak dapat mentransfer miles ke diri sendiri');
      return;
    }

    // Create transfer record
    const newTransfer: Transfer = {
      id: Math.max(...transfers.map((t) => t.id), 0) + 1,
      timestamp: new Date().toLocaleString('id-ID'),
      namaLain: 'Member Baru', // Placeholder - seharusnya dari database
      emailLain: formData.emailPenerima,
      jumlahMiles: miles,
      catatan: formData.catatan || '-',
      tipe: 'Kirim',
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    setCurrentMiles((prev) => prev - miles);

    // Reset form
    setFormData({
      emailPenerima: '',
      jumlahMiles: '',
      catatan: '',
    });
    setShowForm(false);
    setError('');
  };

  const filteredTransfers = filterTipe === 'Semua'
    ? transfers
    : transfers.filter((t) => t.tipe === filterTipe);

  const getTipeColor = (tipe: string) => {
    return tipe === 'Kirim'
      ? 'bg-red-100 text-red-800 border border-red-300'
      : 'bg-green-100 text-green-800 border border-green-300';
  };

  const getTipeIcon = (tipe: string) => {
    return tipe === 'Kirim' ? '📤' : '📥';
  };

  const sentCount = transfers.filter((t) => t.tipe === 'Kirim').length;
  const receivedCount = transfers.filter((t) => t.tipe === 'Terima').length;
  const sentMiles = transfers
    .filter((t) => t.tipe === 'Kirim')
    .reduce((sum, t) => sum + t.jumlahMiles, 0);
  const receivedMiles = transfers
    .filter((t) => t.tipe === 'Terima')
    .reduce((sum, t) => sum + t.jumlahMiles, 0);

  // Access Guard: Hanya untuk Member
  if (user?.role !== 'member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full border-t-4 border-red-500">
          <span className="text-4xl mb-4 block">🚫</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">
            Maaf, halaman ini hanya dapat diakses oleh Member AeroMiles.
          </p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition">
            Kembali ke Dashboard
          </Link>
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
              onClick={() => {
                setShowForm(!showForm);
                setError('');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              + Buat Transfer Baru
            </button>

            {/* Filter Tipe */}
            <div className="flex gap-2 flex-wrap">
              {['Semua', 'Kirim', 'Terima'].map((tipe) => (
                <button
                  key={tipe}
                  onClick={() => setFilterTipe(tipe)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filterTipe === tipe
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                  <input
                    type="email"
                    name="emailPenerima"
                    placeholder="Masukkan email penerima"
                    value={formData.emailPenerima}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Miles</label>
                  <input
                    type="number"
                    name="jumlahMiles"
                    placeholder="Contoh: 5000"
                    min="1"
                    value={formData.jumlahMiles}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Miles Tersedia</label>
                  <input
                    type="text"
                    value={currentMiles.toLocaleString('id-ID')}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                  <textarea
                    name="catatan"
                    placeholder="Tambahkan catatan untuk penerima..."
                    value={formData.catatan}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  >
                    ✅ Konfirmasi Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200"
                  >
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
            {filteredTransfers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Belum ada transfer pada kategori ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Member</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Jumlah Miles</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Catatan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.map((transfer) => (
                      <tr key={transfer.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{transfer.timestamp}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{transfer.namaLain}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{transfer.emailLain}</td>
                        <td className="px-6 py-4 text-sm font-bold">
                          <span className={transfer.tipe === 'Kirim' ? 'text-red-600' : 'text-green-600'}>
                            {transfer.tipe === 'Kirim' ? '-' : '+'} {transfer.jumlahMiles.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{transfer.catatan}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTipeColor(transfer.tipe)}`}>
                            {getTipeIcon(transfer.tipe)} {transfer.tipe}
                          </span>
                        </td>
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
