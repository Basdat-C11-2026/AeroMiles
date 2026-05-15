'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
  const { user } = useAuth();
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'Disetujui' | 'Ditolak'>('Disetujui');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/staff/claims');
      if (res.ok) {
        const data = await res.json();
        
        const mappedData: Claim[] = data.map((item: any) => ({
          id: item.id,
          namaMember: `${item.first_mid_name} ${item.last_name !== '-' ? item.last_name : ''}`.trim(),
          emailMember: item.email_member,
          maskapai: item.maskapai,
          rute: `${item.bandara_asal} → ${item.bandara_tujuan}`,
          tanggalPenerbangan: new Date(item.tanggal_penerbangan).toLocaleDateString('id-ID'),
          flightNumber: item.flight_number,
          kelas: item.kelas_kabin,
          tanggalPengajuan: new Date(item.timestamp).toLocaleString('id-ID'),
          status: item.status_penerimaan || 'Menunggu',
        }));
        
        setClaims(mappedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data klaim", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'staff') {
      fetchClaims();
    }
  }, [user, fetchClaims]);

  const handleStatusChange = (claim: Claim) => {
    setSelectedClaim(claim);
    setNewStatus('Disetujui');
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedClaim || !user?.email) return;

    setIsProcessing(true);
    try {
      const payload = {
        status: newStatus,
        email_staf: user.email, 
      };

      const res = await fetch(`/api/staff/claims/${selectedClaim.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui status');
      }

      setShowStatusModal(false);
      setSelectedClaim(null);
      await fetchClaims();
      
    } catch (error) {
      alert("Terjadi kesalahan saat memperbarui status.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredClaims = filterStatus === 'Semua'
    ? claims
    : claims.filter((c) => c.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Disetujui': return 'bg-green-100 text-green-800 border border-green-300';
      case 'Ditolak': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const menungguCount = claims.filter((c) => c.status === 'Menunggu').length;
  const disetujuiCount = claims.filter((c) => c.status === 'Disetujui').length;
  const ditolakCount = claims.filter((c) => c.status === 'Ditolak').length;

  if (user?.role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full border-t-4 border-red-500">
          <span className="text-4xl mb-4 block">🚫</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Maaf, halaman ini hanya dapat diakses oleh Staff AeroMiles.</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Kelola Klaim Missing Miles</h1>
            <p className="text-gray-600">Proses dan verifikasi klaim missing miles dari member</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <h3 className="text-gray-600 font-medium mb-2">Menunggu Proses</h3>
              <p className="text-3xl font-bold text-yellow-600">{isLoading ? '-' : menungguCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-gray-600 font-medium mb-2">Disetujui</h3>
              <p className="text-3xl font-bold text-green-600">{isLoading ? '-' : disetujuiCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <h3 className="text-gray-600 font-medium mb-2">Ditolak</h3>
              <p className="text-3xl font-bold text-red-600">{isLoading ? '-' : ditolakCount}</p>
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
            
            {isLoading ? (
               <div className="p-12 text-center">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                 <p className="text-gray-500 font-medium">Memuat data klaim dari server...</p>
               </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-lg font-medium">Tidak ada klaim dengan status "{filterStatus}"</p>
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{claim.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{claim.namaMember}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{claim.emailMember}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{claim.maskapai}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 font-bold">{claim.rute}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.flightNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.kelas}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{claim.tanggalPengajuan}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {claim.status === 'Menunggu' ? (
                            <button
                              onClick={() => handleStatusChange(claim)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200 whitespace-nowrap"
                            >
                              ⚙️ Proses
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              {claim.status === 'Disetujui' ? '✅' : '❌'} Selesai
                            </span>
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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proses Klaim #{selectedClaim.id}</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold w-24 inline-block">Member:</span> {selectedClaim.namaMember}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold w-24 inline-block">Maskapai:</span> {selectedClaim.maskapai}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold w-24 inline-block">Rute:</span> {selectedClaim.rute}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">Tentukan Keputusan:</label>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${newStatus === 'Disetujui' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="status"
                    value="Disetujui"
                    checked={newStatus === 'Disetujui'}
                    onChange={(e) => setNewStatus(e.target.value as 'Disetujui' | 'Ditolak')}
                    className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-bold text-green-700">✅ Setujui Klaim</p>
                    <p className="text-xs text-gray-600 mt-1">Status akan diubah menjadi Disetujui</p>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${newStatus === 'Ditolak' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="status"
                    value="Ditolak"
                    checked={newStatus === 'Ditolak'}
                    onChange={(e) => setNewStatus(e.target.value as 'Disetujui' | 'Ditolak')}
                    className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-bold text-red-700">❌ Tolak Klaim</p>
                    <p className="text-xs text-gray-600 mt-1">Klaim tidak memenuhi syarat</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmStatusChange}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : '💾 Simpan Keputusan'}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedClaim(null);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}