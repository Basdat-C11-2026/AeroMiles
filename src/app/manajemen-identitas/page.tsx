'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ManajemenIdentitasMember() {
    const { user } = useAuth();

    // State untuk menyimpan identitas (Read)
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        passportNumber: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    // Inisialisasi data berdasarkan user yang sedang login
    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name,
                email: user.email,
                phone: '081234567890',
                address: 'Jl. Merdeka No. 1, Jakarta',
                passportNumber: 'A1234567'
            });
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update (U)
        setIsEditing(false);
        alert('Identitas berhasil diperbarui!');
    };

    const handleDeleteIdentity = () => {
        // Delete (D)
        if (confirm('PERINGATAN: Apakah Anda yakin ingin menghapus seluruh identitas & akun Anda? Tindakan ini tidak dapat dibatalkan.')) {
            alert('Identitas berhasil dihapus. Anda akan di-logout (Simulasi).');
            // Panggil fungsi logout dari context auth di skenario nyata
        }
    };

    if (!user) return <div className="p-8 text-center text-gray-600">Memuat data identitas...</div>;

    if (user?.role !== 'member') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
                    <p className="text-gray-600">Halaman ini khusus untuk Member AeroMiles.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Identitas Saya</h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium border border-blue-600"
                        >
                            Ubah Identitas
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border rounded-md text-black disabled:bg-gray-100 disabled:text-gray-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border rounded-md text-black disabled:bg-gray-100 disabled:text-gray-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border rounded-md text-black disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Paspor</label>
                        <input
                            type="text"
                            value={profile.passportNumber}
                            onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border rounded-md text-black disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Domisili</label>
                        <textarea
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-md text-black disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>

                    {isEditing && (
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                            >
                                Simpan Perubahan
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium"
                            >
                                Batal
                            </button>
                        </div>
                    )}
                </form>

                {!isEditing && (
                    <div className="mt-10 pt-6 border-t border-red-100">
                        <h3 className="text-lg font-medium text-red-600 mb-2">Zona Berbahaya</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Menghapus identitas berarti menutup akun AeroMiles Anda secara permanen. Seluruh Miles akan hangus.
                        </p>
                        <button
                            onClick={handleDeleteIdentity}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-md font-medium transition"
                        >
                            Hapus Identitas & Akun
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}