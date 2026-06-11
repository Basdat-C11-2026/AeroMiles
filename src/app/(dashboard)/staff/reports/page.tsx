'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

type TransactionType = 'Transfer' | 'Redeem' | 'Beli Package' | 'Klaim Disetujui';

interface Transaction {
    id: string;
    type: TransactionType;
    memberName: string;
    memberEmail: string;
    miles: number;
    timestamp: string;
}

export default function LaporanTransaksiStaf() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'laporan' | 'top'>('laporan');

    // State Data Dinamis
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState({ total_beredar: 0, total_redeem_bulan_ini: 0, total_klaim_disetujui: 0 });
    const [topMembersMiles, setTopMembersMiles] = useState<any[]>([]);
    const [topMembersActive, setTopMembersActive] = useState<any[]>([]);

    // State Filter
    const [filterType, setFilterType] = useState('Semua');
    const [filterMember, setFilterMember] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    async function fetchReports() {
        try {
            const res = await fetch('/api/staff/reports');
            if (res.ok) {
                const data = await res.json();
                
                const formattedTrx = data.transactions.map((t: any, idx: number) => ({
                    id: `TRX-${idx}`,
                    type: t.tipe,
                    memberName: t.member_name,
                    memberEmail: t.member_email,
                    miles: (t.tipe === 'Redeem' || t.tipe === 'Transfer') ? -Math.abs(t.miles) : Math.abs(t.miles),
                    timestamp: new Date(t.timestamp).toISOString().replace('T', ' ').substring(0, 19)
                }));

                setTransactions(formattedTrx);
                setStats(data.stats);
                setTopMembersMiles(data.topMiles);
                setTopMembersActive(data.topActive);
            }
        } catch (err) {
            console.error('Gagal memuat laporan', err);
        }
    }

    if (user?.role !== 'staff') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full border-t-4 border-red-500">
                    <span className="text-4xl mb-4 block">🚫</span>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
                    <p className="text-gray-600 mb-6">Maaf, halaman ini hanya dapat diakses oleh Staf AeroMiles.</p>
                    <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const handleDelete = async (trx: Transaction) => {
        if (trx.type === 'Klaim Disetujui' || trx.type === 'Beli Package') {
            alert(`❌ Ditolak: Riwayat ${trx.type} tidak dapat dihapus dari sistem.`);
            return;
        }

        const confirmDelete = window.confirm(`⚠️ PERINGATAN:\nPenghapusan riwayat transaksi (${trx.type}) ini bersifat permanen dan akan memengaruhi tampilan riwayat yang dilihat oleh Member.\n\nApakah Anda yakin ingin melanjutkan?`);
        
        if (confirmDelete) {
            try {
                const res = await fetch('/api/staff/reports', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipe: trx.type, member: trx.memberEmail, timestamp: trx.timestamp })
                });

                if (res.ok) {
                    alert('Riwayat transaksi berhasil dihapus.');
                    fetchReports(); 
                } else {
                    const err = await res.json();
                    alert(`Gagal menghapus: ${err.error}`);
                }
            } catch (err) {
                console.error(err);
                alert('Terjadi kesalahan saat menghapus riwayat.');
            }
        }
    };

    const filteredTransactions = transactions.filter(trx => {
        const matchType = filterType === 'Semua' || trx.type === filterType;
        const matchMember = trx.memberName.toLowerCase().includes(filterMember.toLowerCase());
        
        const trxDate = trx.timestamp.split(' ')[0];
        const matchDateFrom = dateFrom === '' || trxDate >= dateFrom;
        const matchDateTo = dateTo === '' || trxDate <= dateTo;

        return matchType && matchMember && matchDateFrom && matchDateTo;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Laporan & Transaksi Riwayat Miles</h1>
                        <p className="text-sm text-gray-500 mt-1">Pantau dan analisis aktivitas transaksi miles seluruh member.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-md text-white">
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Miles Beredar</p>
                            <p className="text-3xl font-bold">{Number(stats.total_beredar).toLocaleString()}</p>
                            <p className="text-xs text-blue-200 mt-2">Kumulatif seluruh member aktif</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-md text-white">
                            <p className="text-green-100 text-sm font-medium mb-1">Total Redeem (Bulan Ini)</p>
                            <p className="text-3xl font-bold">{Number(stats.total_redeem_bulan_ini).toLocaleString()}</p>
                            <p className="text-xs text-green-100 mt-2">Miles yang ditukarkan</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-md text-white">
                            <p className="text-indigo-100 text-sm font-medium mb-1">Total Klaim Disetujui</p>
                            <p className="text-3xl font-bold">{Number(stats.total_klaim_disetujui).toLocaleString()}</p>
                            <p className="text-xs text-indigo-100 mt-2">Akumulasi pengajuan</p>
                        </div>
                    </div>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('laporan')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'laporan' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📋 Laporan & Riwayat Transaksi
                    </button>
                    <button
                        onClick={() => setActiveTab('top')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'top' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🏆 Top Member
                    </button>
                </div>

                {activeTab === 'laporan' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipe Transaksi</label>
                                <select 
                                    value={filterType} 
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                >
                                    <option value="Semua">Semua Tipe</option>
                                    <option value="Transfer">Transfer</option>
                                    <option value="Redeem">Redeem</option>
                                    <option value="Beli Package">Beli Package</option>
                                    <option value="Klaim Disetujui">Klaim Disetujui</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cari Member</label>
                                <input 
                                    type="text" 
                                    placeholder="Nama member..." 
                                    value={filterMember}
                                    onChange={(e) => setFilterMember(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai</label>
                                <input 
                                    type="date" 
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Akhir</label>
                                <input 
                                    type="date" 
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Tipe Transaksi</th>
                                        <th className="px-6 py-4 font-semibold">Nama Member</th>
                                        <th className="px-6 py-4 font-semibold text-right">Jumlah Miles</th>
                                        <th className="px-6 py-4 font-semibold">Timestamp</th>
                                        <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredTransactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-semibold
                                                    ${trx.type === 'Klaim Disetujui' ? 'bg-blue-100 text-blue-700' : ''}
                                                    ${trx.type === 'Redeem' ? 'bg-amber-100 text-amber-700' : ''}
                                                    ${trx.type === 'Transfer' ? 'bg-purple-100 text-purple-700' : ''}
                                                    ${trx.type === 'Beli Package' ? 'bg-green-100 text-green-700' : ''}
                                                `}>
                                                    {trx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {trx.memberName} <br/>
                                                <span className="text-xs text-gray-500 font-normal">{trx.memberEmail}</span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${trx.miles > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {trx.miles > 0 ? '+' : ''}{trx.miles.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{trx.timestamp}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleDelete(trx)}
                                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                        (trx.type === 'Klaim Disetujui' || trx.type === 'Beli Package')
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                                    title={(trx.type === 'Klaim Disetujui' || trx.type === 'Beli Package') ? 'Transaksi ini tidak dapat dihapus' : 'Hapus Riwayat'}
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                Tidak ada riwayat transaksi yang ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'top' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2">
                                <span className="text-2xl">👑</span>
                                <h2 className="text-lg font-bold text-amber-900">Top Member (Total Miles)</h2>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {topMembersMiles.map((member, idx) => (
                                    <li key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{member.name}</p>
                                                <p className="text-xs font-medium text-gray-500">Tier: {member.tier}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">{Number(member.totalMiles).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Miles</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
                                <span className="text-2xl">🔥</span>
                                <h2 className="text-lg font-bold text-indigo-900">Paling Aktif (Transfer & Redeem)</h2>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {topMembersActive.map((member, idx) => (
                                    <li key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{member.name}</p>
                                                <p className="text-xs font-medium text-gray-500">{member.activities}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-600">{member.count}</p>
                                            <p className="text-xs text-gray-500">Transaksi</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}