'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface MemberData {
  email: string;
  memberNumber: string;
  salutation: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  birthDate: string;
  nationality: string;
  tier: string;
  totalMiles: number;
  awardMiles: number;
  joinDate: string;
  password?: string;
}

export default function ManajemenDataMember() {
  const { user } = useAuth();

  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('Semua Tier');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const defaultForm: Partial<MemberData> = {
    email: '', password: '', salutation: '', firstName: '', lastName: '',
    countryCode: '+62', phone: '', birthDate: '', nationality: '', tier: 'Blue'
  };
  const [formData, setFormData] = useState<Partial<MemberData>>(defaultForm);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/staff/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.map((m: any) => ({
          email: m.email,
          memberNumber: m.nomor_member,
          salutation: m.salutation,
          firstName: m.first_mid_name,
          lastName: m.last_name,
          tier: m.tier,
          totalMiles: m.total_miles,
          awardMiles: m.award_miles,
          joinDate: new Date(m.tanggal_bergabung).toLocaleDateString('id-ID'),
        })));
      }
    } catch (error) {
      console.error("Gagal memuat member", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'staff') fetchMembers();
  }, [user]);

  if (user?.role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Halaman ini hanya dapat diakses oleh Staf AeroMiles.</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Ke Beranda</Link>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (email: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/staff/members/${encodeURIComponent(email)}`);
      
      const rawText = await res.text();
      
      if (!res.ok) {
        let errorMessage = `Server Error ${res.status}`;
        try {
           const errJson = JSON.parse(rawText);
           errorMessage = errJson.error || errorMessage;
        } catch {
           errorMessage = rawText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let m;
      try {
        m = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error(`Data bukan JSON! Balasan mentah server:\n${rawText}`);
      }

      setFormData({
        email: m.email,
        memberNumber: m.nomor_member,
        salutation: m.salutation,
        firstName: m.first_mid_name,
        lastName: m.last_name,
        countryCode: m.country_code,
        phone: m.mobile_number,
        birthDate: m.tanggal_lahir ? new Date(m.tanggal_lahir).toISOString().split('T')[0] : '',
        nationality: m.kewarganegaraan,
        tier: m.id_tier 
      });
      setIsEditing(true);
      setIsModalOpen(true);
      
    } catch (error: any) {
      alert(`Gagal mengambil detail member:\n${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (email: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus ${name}? Data tidak dapat dikembalikan.`)) {
      try {
        const res = await fetch(`/api/staff/members/${encodeURIComponent(email)}`, { method: 'DELETE' });
        if (res.ok) {
          alert('Member berhasil dihapus!');
          fetchMembers();
        } else {
          const err = await res.json();
          alert(`Gagal menghapus: ${err.error}`);
        }
      } catch (error) {
        alert("Terjadi kesalahan sistem.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const payload = {
      email: formData.email,
      password: formData.password, 
      salutation: formData.salutation,
      first_mid_name: formData.firstName,
      last_name: formData.lastName,
      country_code: formData.countryCode,
      mobile_number: formData.phone,
      tanggal_lahir: formData.birthDate,
      kewarganegaraan: formData.nationality,
      id_tier: formData.tier 
    };

    try {
      let res;
      if (isEditing) {
        res = await fetch(`/api/staff/members/${encodeURIComponent(formData.email!)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/staff/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      alert(`Member berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}!`);
      setIsModalOpen(false);
      fetchMembers();
    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchSearch =
      m.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTier = tierFilter === 'Semua Tier' || m.tier === tierFilter;

    return matchSearch && matchTier;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">👥 Kelola Member</h1>
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2"
          >
            <span>+</span> Tambah Member Baru
          </button>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Cari nama, email, atau nomor member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black min-w-[150px]"
          >
            <option value="Semua Tier">Semua Tier</option>
            <option value="Blue">Blue</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>

        {/* Tabel Data Member */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Memuat database member...</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">No. Member</th>
                  <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Tier</th>
                  <th className="px-6 py-4 font-semibold">Total / Award Miles</th>
                  <th className="px-6 py-4 font-semibold">Bergabung</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <tr key={member.email} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{member.memberNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{member.salutation} {member.firstName} {member.lastName}</td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border
                        ${member.tier === 'Blue' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${member.tier === 'Silver' ? 'bg-slate-50 text-slate-700 border-slate-300' : ''}
                        ${member.tier === 'Gold' ? 'bg-amber-50 text-amber-700 border-amber-300' : ''}
                        ${member.tier === 'Platinum' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                      `}>
                        {member.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {member.totalMiles?.toLocaleString('id-ID')} / <span className="text-green-600 font-bold">{member.awardMiles?.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{member.joinDate}</td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button disabled={isProcessing} onClick={() => handleOpenEdit(member.email)} className="text-blue-600 hover:text-blue-800 disabled:opacity-50" title="Edit">✏️</button>
                      <button disabled={isProcessing} onClick={() => handleDelete(member.email, member.firstName)} className="text-red-600 hover:text-red-800 disabled:opacity-50" title="Hapus">🗑️</button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data member yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Form Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                {isEditing ? 'Edit Data Member' : 'Tambah Member Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="memberForm" onSubmit={handleSubmit} className="space-y-4">
                {/* Email & Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email" required disabled={isEditing}
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-black ${isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'focus:ring-2 focus:ring-blue-500'}`}
                    />
                  </div>
                  {!isEditing && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Password Sementara</label>
                      <input
                        type="password" required
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                      />
                    </div>
                  )}
                  {isEditing && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nomor Member</label>
                      <input type="text" disabled value={formData.memberNumber} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 font-mono" />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Data Profil */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
                    <select required value={formData.salutation} onChange={e => setFormData({ ...formData, salutation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih...</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                    <input type="text" required value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Depan-Tengah</label>
                    <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Belakang</label>
                    <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nomor HP</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.countryCode} onChange={e => setFormData({ ...formData, countryCode: e.target.value })} className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-black text-center" />
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input type="date" required value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Edit Tier (Hanya saat Edit) */}
                {isEditing && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <label className="block text-xs font-bold text-amber-900 mb-1">Ubah Tier (Override Manual)</label>
                    <select value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })} className="w-full md:w-1/2 px-3 py-2 border border-amber-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-amber-500">
                      <option value="Blue">Blue</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                    <p className="text-[10px] text-amber-700 mt-1">Hanya ubah tier jika ada kebijakan khusus. Tier akan terkalkulasi ulang saat member memiliki klaim yang disetujui.</p>
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button disabled={isProcessing} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                Batal
              </button>
              <button disabled={isProcessing} form="memberForm" type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50">
                {isProcessing ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}