'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Interface Data Member
interface MemberData {
  id: string;
  memberNumber: string;
  email: string;
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

// Data Dummy Awal
const initialMembers: MemberData[] = [
  {
    id: '1',
    memberNumber: 'AM-98765432',
    email: 'john.doe@example.com',
    salutation: 'Mr',
    firstName: 'John William',
    lastName: 'Doe',
    countryCode: '+62',
    phone: '81234567890',
    birthDate: '1990-01-15',
    nationality: 'Indonesia',
    tier: 'Gold',
    totalMiles: 245850,
    awardMiles: 150000,
    joinDate: '2022-05-20',
  },
  {
    id: '2',
    memberNumber: 'AM-12345678',
    email: 'jane.smith@example.com',
    salutation: 'Mrs',
    firstName: 'Jane',
    lastName: 'Smith',
    countryCode: '+65',
    phone: '87654321',
    birthDate: '1985-08-22',
    nationality: 'Singapore',
    tier: 'Blue',
    totalMiles: 12500,
    awardMiles: 12500,
    joinDate: '2024-01-10',
  }
];

export default function ManajemenDataMember() {
  const { user } = useAuth();
  
  const [members, setMembers] = useState<MemberData[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('Semua Tier');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const defaultForm: Partial<MemberData> = {
    email: '', password: '', salutation: '', firstName: '', lastName: '',
    countryCode: '+62', phone: '', birthDate: '', nationality: '', tier: 'Blue'
  };
  const [formData, setFormData] = useState<Partial<MemberData>>(defaultForm);

  // Akses Guard
  if (user?.role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-gray-600">Halaman ini hanya dapat diakses oleh Staf AeroMiles.</p>
        </div>
      </div>
    );
  }

  // Handle Buka Modal Tambah
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  // Handle Buka Modal Edit
  const handleOpenEdit = (member: MemberData) => {
    setIsEditing(true);
    setFormData(member);
    setIsModalOpen(true);
  };

  // Handle Hapus (Delete)
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus member ${name}? Seluruh data terkait juga akan terhapus.`)) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  // Handle Submit Form (Create / Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update Logic
      setMembers(members.map(m => m.id === formData.id ? { ...m, ...formData } as MemberData : m));
      alert('Data member berhasil diperbarui!');
    } else {
      // Create Logic
      const newMember: MemberData = {
        ...formData as MemberData,
        id: Date.now().toString(),
        memberNumber: `AM-${Math.floor(10000000 + Math.random() * 90000000)}`, 
        tier: 'Blue', 
        totalMiles: 0,
        awardMiles: 0,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setMembers([newMember, ...members]);
      alert('Member baru berhasil ditambahkan!');
    }
    
    setIsModalOpen(false);
  };

  // Filter & Search Logic
  const filteredMembers = members.filter(m => {
    const matchSearch = 
      m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchTier = tierFilter === 'Semua Tier' || m.tier === tierFilter;
    
    return matchSearch && matchTier;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Member</h1>
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2"
          >
            <span>+</span> Tambah Member
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
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{member.memberNumber}</td>
                  <td className="px-6 py-4 text-gray-700">{member.salutation}. {member.firstName} {member.lastName}</td>
                  <td className="px-6 py-4 text-gray-600">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${member.tier === 'Blue' ? 'bg-blue-100 text-blue-700' : ''}
                      ${member.tier === 'Silver' ? 'bg-gray-200 text-gray-700' : ''}
                      ${member.tier === 'Gold' ? 'bg-amber-100 text-amber-700' : ''}
                      ${member.tier === 'Platinum' ? 'bg-indigo-100 text-indigo-700' : ''}
                    `}>
                      {member.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.totalMiles.toLocaleString()} / <span className="text-green-600 font-medium">{member.awardMiles.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{member.joinDate}</td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button onClick={() => handleOpenEdit(member)} className="text-blue-600 hover:text-blue-800" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(member.id, member.firstName)} className="text-red-600 hover:text-red-800" title="Hapus">🗑️</button>
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
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-black ${isEditing ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`} 
                    />
                  </div>
                  {!isEditing && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                      <input 
                        type="password" required 
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black" 
                      />
                    </div>
                  )}
                  {isEditing && (
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Nomor Member</label>
                       <input type="text" disabled value={formData.memberNumber} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-black" />
                     </div>
                  )}
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Data Profil */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
                    <select required value={formData.salutation} onChange={e => setFormData({...formData, salutation: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih...</option>
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Ms">Ms.</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                    <input type="text" required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Depan-Tengah</label>
                    <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Belakang</label>
                    <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nomor HP</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.countryCode} onChange={e => setFormData({...formData, countryCode: e.target.value})} className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-black text-center" />
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Edit Tier (Hanya saat Edit) */}
                {isEditing && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <label className="block text-xs font-bold text-amber-900 mb-1">Ubah Tier (Manual)</label>
                    <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} className="w-full md:w-1/2 px-3 py-2 border border-amber-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-amber-500">
                      <option value="Blue">Blue</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                )}
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                Batal
              </button>
              <button form="memberForm" type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}