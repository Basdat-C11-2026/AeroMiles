'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Interface untuk Dokumen Identitas
interface IdentityDocument {
  id: string;
  documentNumber: string;
  type: 'Paspor' | 'KTP' | 'SIM' | '';
  issueCountry: string;
  issueDate: string;
  expiryDate: string;
}

// Data Dummy Awal
const initialDocuments: IdentityDocument[] = [
  {
    id: '1',
    documentNumber: 'A1234567',
    type: 'Paspor',
    issueCountry: 'Indonesia',
    issueDate: '2020-05-15',
    expiryDate: '2025-05-15',
  },
  {
    id: '2',
    documentNumber: '3171234567890001',
    type: 'KTP',
    issueCountry: 'Indonesia',
    issueDate: '2015-01-01',
    expiryDate: '2099-12-31', 
  }
];

export default function ManajemenIdentitasMember() {
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<IdentityDocument[]>(initialDocuments);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const defaultForm: IdentityDocument = {
    id: '', documentNumber: '', type: '', issueCountry: '', issueDate: '', expiryDate: ''
  };
  const [formData, setFormData] = useState<IdentityDocument>(defaultForm);

  // Akses Guard: Hanya untuk Member
  if (user?.role !== 'member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
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

  // --- Handlers ---

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(defaultForm);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: IdentityDocument) => {
    setIsEditing(true);
    setFormData(doc);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, docNumber: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus dokumen identitas nomor ${docNumber}?`)) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi Field Kosong
    if (!formData.documentNumber || !formData.type || !formData.issueCountry || !formData.issueDate || !formData.expiryDate) {
      setErrorMsg('Semua field wajib diisi.');
      return;
    }

    if (isEditing) {
      // Logic Update
      setDocuments(documents.map(d => d.id === formData.id ? formData : d));
      alert('Dokumen identitas berhasil diperbarui!');
    } else {
      // Logic Create (Termasuk Cek Nomor Dokumen Unik)
      const isDuplicate = documents.some(d => d.documentNumber.toLowerCase() === formData.documentNumber.toLowerCase());
      if (isDuplicate) {
        setErrorMsg('Nomor dokumen ini sudah terdaftar dalam sistem.');
        return;
      }

      const newDoc = { ...formData, id: Date.now().toString() };
      setDocuments([...documents, newDoc]);
      alert('Dokumen identitas baru berhasil ditambahkan!');
    }
    
    setIsModalOpen(false);
  };

  // Helper untuk mengecek status expired
  const isExpired = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Identitas Saya</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola dokumen identitas Anda (KTP, Paspor, SIM) untuk keperluan penerbangan.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition"
          >
            <span>+</span> Tambah Identitas
          </button>
        </div>

        {/* Tabel Data Identitas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Jenis</th>
                <th className="px-6 py-4 font-semibold">Nomor Dokumen</th>
                <th className="px-6 py-4 font-semibold">Negara Penerbit</th>
                <th className="px-6 py-4 font-semibold">Tanggal Terbit</th>
                <th className="px-6 py-4 font-semibold">Berlaku Hingga</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => {
                const expired = isExpired(doc.expiryDate);
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{doc.type}</td>
                    <td className="px-6 py-4 text-gray-700 font-mono">{doc.documentNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.issueCountry}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.issueDate}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.expiryDate}</td>
                    <td className="px-6 py-4">
                      {expired ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Kedaluwarsa</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Aktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button onClick={() => handleOpenEdit(doc)} className="text-blue-600 hover:text-blue-800" title="Edit">✏️</button>
                      <button onClick={() => handleDelete(doc.id, doc.documentNumber)} className="text-red-600 hover:text-red-800" title="Hapus">🗑️</button>
                    </td>
                  </tr>
                );
              })}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Belum ada dokumen identitas yang didaftarkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah/Edit Identitas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                {isEditing ? 'Edit Dokumen Identitas' : 'Tambah Identitas Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                  {errorMsg}
                </div>
              )}

              <form id="identityForm" onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen</label>
                    <select 
                      required 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value as any})} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih...</option>
                      <option value="Paspor">Paspor</option>
                      <option value="KTP">KTP</option>
                      <option value="SIM">SIM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Dokumen</label>
                    <input 
                      type="text" required 
                      disabled={isEditing} // Aturan: Nomor dokumen tidak dapat diubah
                      value={formData.documentNumber} 
                      onChange={e => setFormData({...formData, documentNumber: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black outline-none ${isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'focus:ring-2 focus:ring-blue-500'}`} 
                      placeholder="Contoh: A1234567"
                    />
                    {isEditing && <p className="text-[10px] text-red-500 mt-1">*Nomor dokumen tidak dapat diubah</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Negara Penerbit</label>
                  <input 
                    type="text" required 
                    value={formData.issueCountry} 
                    onChange={e => setFormData({...formData, issueCountry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Contoh: Indonesia"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terbit</label>
                    <input 
                      type="date" required 
                      value={formData.issueDate} 
                      onChange={e => setFormData({...formData, issueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Habis Berlaku</label>
                    <input 
                      type="date" required 
                      value={formData.expiryDate} 
                      onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                Batal
              </button>
              <button form="identityForm" type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}