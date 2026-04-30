'use client';

import { useState } from 'react';

interface Claim {
  id: number;
  namaMember: string;
  emailMember: string;
  maskapai: string;
  rute: string;
  tanggalPenerbangan: string;
  flightNumber: string;
  kelas: string;
  tanggalPengajuan: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  emailStaf?: string;
}

export default function ManageClaimsStaf() {
  const [claims, setClaims] = useState<Claim[]>([
    {
      id: 1,
      namaMember: 'John Doe',
      emailMember: 'john@example.com',
      maskapai: 'Garuda Indonesia',
      rute: 'CGK → DPS',
      tanggalPenerbangan: '2026-04-15',
      flightNumber: 'GA-101',
      kelas: 'Economy',
      tanggalPengajuan: '2026-04-20',
      status: 'Menunggu',
    },
    {
      id: 2,
      namaMember: 'Jane Smith',
      emailMember: 'jane@example.com',
      maskapai: 'Batik Air',
      rute: 'DPS → SUB',
      tanggalPenerbangan: '2026-04-10',
      flightNumber: 'BK-202',
      kelas: 'Business',
      tanggalPengajuan: '2026-04-18',
      status: 'Menunggu',
    },
    {
      id: 3,
      namaMember: 'Robert Johnson',
      emailMember: 'robert@example.com',
      maskapai: 'Lion Air',
      rute: 'SUB → CGK',
      tanggalPenerbangan: '2026-04-05',
      flightNumber: 'JT-501',
      kelas: 'Economy',
      tanggalPengajuan: '2026-04-12',
      status: 'Disetujui',
      emailStaf: 'staf@aeromiles.com',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'Disetujui' | 'Ditolak'>('Disetujui');

  const handleStatusChange = (claim: Claim) => {
    setSelectedClaim(claim);
    setNewStatus('Disetujui');
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedClaim) {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? {
                ...c,
                status: newStatus,
                emailStaf: 'staf@aeromiles.com', // Placeholder untuk email staf yang login
              }
            : c
        )
      );
      setShowStatusModal(false);
      setSelectedClaim(null);
    }
  };

  const filteredClaims = filterStatus === 'Semua'
    ? claims
    : claims.filter((c) => c.status === filterStatus);

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

  const menungguCount = claims.filter((c) => c.status === 'Menunggu').length;
  const disetujuiCount = claims.filter((c) => c.status === 'Disetujui').length;
  const ditolakCount = claims.filter((c) => c.status === 'Ditolak').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Kelola Klaim Missing Miles</h1>
            <p className="text-gray-600">Proses dan verifikasi klaim missing miles dari member</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <h3 className="text-gray-600 font-medium mb-2">Menunggu Proses</h3>
              <p className="text-3xl font-bold text-yellow-600">{menungguCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-gray-600 font-medium mb-2">Disetujui</h3>
              <p className="text-3xl font-bold text-green-600">{disetujuiCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <h3 className="text-gray-600 font-medium mb-2">Ditolak</h3>
              <p className="text-3xl font-bold text-red-600">{ditolakCount}</p>
            </div>
          </div>

          {/* Filter Status */}
          <div className="flex gap-2 flex-wrap mb-8">
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

          {/* Claims Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900">Daftar Klaim ({filteredClaims.length})</h2>
            </div>
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Tidak ada klaim dengan status ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Member</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Maskapai</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rute</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Flight</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kelas</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tgl Pengajuan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{claim.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.namaMember}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.emailMember}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{claim.maskapai}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.rute}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.flightNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.kelas}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.tanggalPengajuan}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {claim.status === 'Menunggu' ? (
                            <button
                              onClick={() => handleStatusChange(claim)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200"
                            >
                              ⚙️ Proses
                            </button>
                          ) : (
                            <span className="text-gray-500 text-xs">Sudah diproses</span>
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

      {/* Status Modal */}
      {showStatusModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ubah Status Klaim</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Member:</strong> {selectedClaim.namaMember}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Maskapai:</strong> {selectedClaim.maskapai}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Rute:</strong> {selectedClaim.rute}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Status</label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="Disetujui"
                    checked={newStatus === 'Disetujui'}
                    onChange={(e) => setNewStatus(e.target.value as 'Disetujui' | 'Ditolak')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">✅ Disetujui</p>
                    <p className="text-xs text-gray-600">Miles akan ditambahkan ke akun member</p>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="Ditolak"
                    checked={newStatus === 'Ditolak'}
                    onChange={(e) => setNewStatus(e.target.value as 'Disetujui' | 'Ditolak')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">❌ Ditolak</p>
                    <p className="text-xs text-gray-600">Klaim tidak memenuhi kriteria</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmStatusChange}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                💾 Simpan Status
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedClaim(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200"
              >
                ❌ Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
