'use client';

import { useState, useEffect } from 'react';
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
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchClaims = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/member/claims?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        
        const mappedData: Claim[] = data.map((item: any) => ({
          id: item.id,
          maskapai: item.maskapai,
          bandaraAsal: item.bandara_asal,
          bandaraTujuan: item.bandara_tujuan,
          tanggalPenerbangan: new Date(item.tanggal_penerbangan).toISOString().split('T')[0],
          flightNumber: item.flight_number,
          nomorTiket: item.nomor_tiket,
          kelasKabin: item.kelas_kabin,
          pnr: item.pnr,
          status: item.status_penerimaan || 'Menunggu',
          timestamp: new Date(item.timestamp).toLocaleString('id-ID')
        }));
        
        setClaims(mappedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data klaim", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'member') {
      fetchClaims();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isUppercaseField = ['bandaraAsal', 'bandaraTujuan', 'pnr'].includes(name);
    setFormData((prev) => ({ 
      ...prev, 
      [name]: isUppercaseField ? value.toUpperCase() : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email_member: user?.email, 
      maskapai: formData.maskapai,
      bandara_asal: formData.bandaraAsal,
      bandara_tujuan: formData.bandaraTujuan,
      tanggal_penerbangan: formData.tanggalPenerbangan,
      flight_number: formData.flightNumber,
      nomor_tiket: formData.nomorTiket,
      kelas_kabin: formData.kelasKabin,
      pnr: formData.pnr,
    };

    try {
      if (editingId) {
        await fetch(`/api/member/claims/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/member/claims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await fetchClaims(); 

      setFormData({
        maskapai: '', bandaraAsal: '', bandaraTujuan: '', tanggalPenerbangan: '',
        flightNumber: '', nomorTiket: '', kelasKabin: 'Economy', pnr: '',
      });
      setShowForm(false);
      setEditingId(null);

    } catch (error) {
      alert("Gagal memproses klaim.");
    }
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Batalkan klaim ini?')) {
      try {
        await fetch(`/api/member/claims/${id}`, { 
          method: 'DELETE' 
        });
        fetchClaims(); 
      } catch (error) {
        alert("Gagal membatalkan klaim");
      }
    }
  };

  const filteredClaims = filterStatus === 'Semua' 
    ? claims 
    : claims.filter((c) => c.status === filterStatus);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Disetujui': return 'bg-green-100 text-green-800 border border-green-300';
      case 'Ditolak': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800';
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
                  maskapai: '', bandaraAsal: '', bandaraTujuan: '', tanggalPenerbangan: '',
                  flightNumber: '', nomorTiket: '', kelasKabin: 'Economy', pnr: '',
                });
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              {showForm ? '− Tutup Form' : '+ Ajukan Klaim Baru'}
            </button>

            <div className="flex gap-2 flex-wrap">
              {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filterStatus === status ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                  <input type="text" name="maskapai" placeholder="Kode/Nama Maskapai" value={formData.maskapai} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bandara Asal (IATA)</label>
                  <input type="text" name="bandaraAsal" placeholder="Cth: CGK" maxLength={3} value={formData.bandaraAsal} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bandara Tujuan (IATA)</label>
                  <input type="text" name="bandaraTujuan" placeholder="Cth: DPS" maxLength={3} value={formData.bandaraTujuan} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Penerbangan</label>
                  <input type="date" name="tanggalPenerbangan" value={formData.tanggalPenerbangan} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flight Number</label>
                  <input type="text" name="flightNumber" placeholder="Cth: GA-101" value={formData.flightNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Tiket</label>
                  <input type="text" name="nomorTiket" placeholder="Nomor Tiket" value={formData.nomorTiket} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelas Kabin</label>
                  <select name="kelasKabin" value={formData.kelasKabin} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Economy</option>
                    <option>Business</option>
                    <option>First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PNR</label>
                  <input type="text" name="pnr" placeholder="Passenger Name Record" value={formData.pnr} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                    {editingId ? '💾 Perbarui Klaim' : '✅ Ajukan Klaim'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200">
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
            
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Memuat data klaim...</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Belum ada klaim yang diajukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Waktu Pengajuan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Maskapai</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rute</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tgl Penerbangan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-xs text-gray-500">{claim.timestamp}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {claim.maskapai}<br/>
                          <span className="text-xs text-gray-500">{claim.flightNumber} • {claim.kelasKabin}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-bold text-blue-600">
                          {claim.bandaraAsal} ✈️ {claim.bandaraTujuan}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.tanggalPenerbangan}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          {claim.status === 'Menunggu' ? (
                            <>
                              <button onClick={() => handleEdit(claim)} className="text-blue-600 hover:text-blue-800 font-medium">✏️ Edit</button>
                              <button onClick={() => handleDelete(claim.id)} className="text-red-600 hover:text-red-800 font-medium">🗑️ Hapus</button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">Terkunci</span>
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