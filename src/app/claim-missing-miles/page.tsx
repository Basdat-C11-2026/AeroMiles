'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Claim {
  id: number;
  maskapai: string;
  bandaraAsal: string;
  bandaraTujuan: string;
  tanggalPenerbangan: string;
  flightNumber: string;
  nomorTiket: string;
  kelasKabin: string;
  pnr: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  timestamp: string;
}

export default function ClaimMissingMiles() {
  const { user } = useAuth();
  
  const [claims, setClaims] = useState<Claim[]>([
    {
      id: 1,
      maskapai: 'Garuda Indonesia',
      bandaraAsal: 'CGK',
      bandaraTujuan: 'DPS',
      tanggalPenerbangan: '2026-04-15',
      flightNumber: 'GA-101',
      nomorTiket: 'TKT001',
      kelasKabin: 'Economy',
      pnr: 'ABC123',
      status: 'Menunggu',
      timestamp: '2026-04-20 10:30',
    },
    {
      id: 2,
      maskapai: 'Batik Air',
      bandaraAsal: 'DPS',
      bandaraTujuan: 'SUB',
      tanggalPenerbangan: '2026-04-10',
      flightNumber: 'BK-202',
      nomorTiket: 'TKT002',
      kelasKabin: 'Business',
      pnr: 'DEF456',
      status: 'Disetujui',
      timestamp: '2026-04-18 14:15',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    maskapai: '',
    bandaraAsal: '',
    bandaraTujuan: '',
    tanggalPenerbangan: '',
    flightNumber: '',
    nomorTiket: '',
    kelasKabin: 'Economy',
    pnr: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing claim
      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === editingId
            ? { ...claim, ...formData }
            : claim
        )
      );
      setEditingId(null);
    } else {
      // Create new claim
      const newClaim: Claim = {
        id: Math.max(...claims.map((c) => c.id), 0) + 1,
        ...formData,
        status: 'Menunggu',
        timestamp: new Date().toLocaleString('id-ID'),
      };
      setClaims((prev) => [newClaim, ...prev]);
    }

    setFormData({
      maskapai: '',
      bandaraAsal: '',
      bandaraTujuan: '',
      tanggalPenerbangan: '',
      flightNumber: '',
      nomorTiket: '',
      kelasKabin: 'Economy',
      pnr: '',
    });
    setShowForm(false);
  };

  const handleEdit = (claim: Claim) => {
    if (claim.status === 'Menunggu') {
      setFormData({
        maskapai: claim.maskapai,
        bandaraAsal: claim.bandaraAsal,
        bandaraTujuan: claim.bandaraTujuan,
        tanggalPenerbangan: claim.tanggalPenerbangan,
        flightNumber: claim.flightNumber,
        nomorTiket: claim.nomorTiket,
        kelasKabin: claim.kelasKabin,
        pnr: claim.pnr,
      });
      setEditingId(claim.id);
      setShowForm(true);
    }
  };

  const handleDelete = (id: number) => {
    const claim = claims.find((c) => c.id === id);
    if (claim && claim.status === 'Menunggu' && window.confirm('Batalkan klaim ini?')) {
      setClaims((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filteredClaims = filterStatus === 'Semua' 
    ? claims 
    : claims.filter((c) => c.status === filterStatus);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Disetujui':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'Ditolak':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Klaim Missing Miles</h1>
            <p className="text-gray-600">Kelola klaim miles dari penerbangan yang belum tercatat</p>
          </div>

          {/* Action Buttons and Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  maskapai: '',
                  bandaraAsal: '',
                  bandaraTujuan: '',
                  tanggalPenerbangan: '',
                  flightNumber: '',
                  nomorTiket: '',
                  kelasKabin: 'Economy',
                  pnr: '',
                });
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              + Ajukan Klaim Baru
            </button>

            {/* Filter Status */}
            <div className="flex gap-2 flex-wrap">
              {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Form Section */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? '✏️ Edit Klaim' : '➕ Ajukan Klaim Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maskapai</label>
                  <input
                    type="text"
                    name="maskapai"
                    placeholder="Nama Maskapai"
                    value={formData.maskapai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bandara Asal (IATA)</label>
                  <input
                    type="text"
                    name="bandaraAsal"
                    placeholder="Cth: CGK"
                    maxLength={3}
                    value={formData.bandaraAsal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bandara Tujuan (IATA)</label>
                  <input
                    type="text"
                    name="bandaraTujuan"
                    placeholder="Cth: DPS"
                    maxLength={3}
                    value={formData.bandaraTujuan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Penerbangan</label>
                  <input
                    type="date"
                    name="tanggalPenerbangan"
                    value={formData.tanggalPenerbangan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flight Number</label>
                  <input
                    type="text"
                    name="flightNumber"
                    placeholder="Cth: GA-101"
                    value={formData.flightNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Tiket</label>
                  <input
                    type="text"
                    name="nomorTiket"
                    placeholder="Nomor Tiket"
                    value={formData.nomorTiket}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelas Kabin</label>
                  <select
                    name="kelasKabin"
                    value={formData.kelasKabin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Economy</option>
                    <option>Business</option>
                    <option>First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PNR</label>
                  <input
                    type="text"
                    name="pnr"
                    placeholder="Passenger Name Record"
                    value={formData.pnr}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  >
                    {editingId ? '💾 Perbarui Klaim' : '✅ Ajukan Klaim'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200"
                  >
                    ❌ Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Claims List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Klaim ({filteredClaims.length})</h2>
            </div>
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Belum ada klaim yang diajukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Maskapai</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rute</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tgl Penerbangan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Flight</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kelas</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{claim.maskapai}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {claim.bandaraAsal} → {claim.bandaraTujuan}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.tanggalPenerbangan}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.flightNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.kelasKabin}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          {claim.status === 'Menunggu' && (
                            <>
                              <button
                                onClick={() => handleEdit(claim)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(claim.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                🗑️ Hapus
                              </button>
                            </>
                          )}
                          {claim.status !== 'Menunggu' && (
                            <span className="text-gray-500 text-xs">Tidak dapat diubah</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
