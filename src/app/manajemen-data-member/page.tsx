'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Member {
    id: number;
    name: string;
    email: string;
    tier: string;
}

export default function ManajemenDataMember() {
    const [members, setMembers] = useState<Member[]>([
        { id: 1, name: 'Budi Santoso', email: 'budi@example.com', tier: 'Gold' },
        { id: 2, name: 'Siti Aminah', email: 'siti@example.com', tier: 'Silver' },
    ]);

    const [form, setForm] = useState<Member>({ id: 0, name: '', email: '', tier: 'Blue' });
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            setMembers(members.map(m => (m.id === form.id ? form : m)));
        } else {
            setMembers([...members, { ...form, id: Date.now() }]);
        }
        setForm({ id: 0, name: '', email: '', tier: 'Blue' });
        setIsEditing(false);
    };

    const handleEdit = (member: Member) => {
        setForm(member);
        setIsEditing(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus member ini?')) {
            setMembers(members.filter(m => m.id !== id));
        }
    };

    const { user } = useAuth();

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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Data Member (Staf)</h1>

                {/* Form Create / Update */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Member' : 'Tambah Member Baru'}</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="px-4 py-2 border rounded-md flex-1 text-black"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="px-4 py-2 border rounded-md flex-1 text-black"
                            required
                        />
                        <select
                            value={form.tier}
                            onChange={(e) => setForm({ ...form, tier: e.target.value })}
                            className="px-4 py-2 border rounded-md text-black"
                        >
                            <option value="Blue">Blue</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                        >
                            {isEditing ? 'Simpan Edit' : 'Tambah'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setForm({ id: 0, name: '', email: '', tier: 'Blue' }); }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                            >
                                Batal
                            </button>
                        )}
                    </form>
                </div>

                {/* Read / List Members (R) */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((member) => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.tier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button onClick={() => handleEdit(member)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Belum ada data member.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}