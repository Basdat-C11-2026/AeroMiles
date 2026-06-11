'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Reward {
  id: string;
  name: string;
  provider: string;
  requiredMiles: number;
  description: string;
  validStart: string;
  validEnd: string;
}

interface RedeemHistory {
  id: string;
  rewardName: string;
  timestamp: string;
  milesUsed: number;
}

export default function RedeemHadiah() {
  const { user, updateProfile } = useAuth();
  
  const [catalog, setCatalog] = useState<Reward[]>([]);
  const [history, setHistory] = useState<RedeemHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'katalog' | 'riwayat'>('katalog');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const catalogRes = await fetch('/api/member/redeem?type=catalog');
      if (catalogRes.ok) {
        const rawCatalog = await catalogRes.json();
        setCatalog(rawCatalog.map((item: any) => ({
          ...item,
          validStart: new Date(item.validStart).toISOString().split('T')[0],
          validEnd: new Date(item.validEnd).toISOString().split('T')[0],
        })));
      }

      const historyRes = await fetch(`/api/member/redeem?type=history&email=${encodeURIComponent(user.email)}`);
      if (historyRes.ok) {
        const rawHistory = await historyRes.json();
        setHistory(rawHistory.map((item: any, idx: number) => ({
          id: `${item.kode_hadiah}-${idx}`, 
          rewardName: item.reward_name,
          timestamp: new Date(item.timestamp).toLocaleString('id-ID'),
          milesUsed: item.miles_used,
        })));
      }
    } catch (error) {
      console.error("Gagal memuat data redeem", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'member') {
      fetchData();
    }
  }, [user]);

  if (user?.role !== 'member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full border-t-4 border-red-500">
          <span className="text-4xl mb-4 block">🚫</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Maaf, halaman ini hanya dapat diakses oleh Member AeroMiles.</p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleOpenRedeemModal = (reward: Reward) => {
    setSelectedReward(reward);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !user?.email) return;

    const currentMiles = user.awardMiles || 0;
    if (currentMiles < selectedReward.requiredMiles) {
      setErrorMsg(`Award miles Anda tidak mencukupi. (Dibutuhkan: ${selectedReward.requiredMiles.toLocaleString()}, Tersedia: ${currentMiles.toLocaleString()})`);
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/member/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_member: user.email,
          kode_hadiah: selectedReward.id
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memproses transaksi redeem.');
      }

      const newAwardMiles = currentMiles - selectedReward.requiredMiles;
      await updateProfile({ 
        awardMiles: newAwardMiles,
        totalMiles: user.totalMiles 
      });

      alert('Redeem Hadiah Berhasil! Detail hadiah akan dikirimkan ke email Anda.');
      setIsModalOpen(false);
      
      await fetchData();
      setActiveTab('riwayat');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & User Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redeem Hadiah</h1>
            <p className="text-sm text-gray-500 mt-1">Tukarkan award miles Anda dengan penawaran menarik.</p>
          </div>
          <div className="text-right bg-blue-50 px-6 py-3 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800 font-medium">Award Miles Anda:</p>
            <p className="text-2xl font-bold text-blue-600">{(user.awardMiles || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('katalog')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'katalog' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🎁 Katalog Hadiah
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'riwayat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            📜 Riwayat Redeem
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Memuat data hadiah dan riwayat Anda...</p>
          </div>
        ) : (
          <>
            {/* --- TAB: KATALOG HADIAH --- */}
            {activeTab === 'katalog' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {catalog.map((reward) => (
                  <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">{reward.provider}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{reward.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{reward.description}</p>
                      
                      <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                        Periode: {reward.validStart} s.d. {reward.validEnd}
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Dibutuhkan</p>
                        <p className="font-bold text-blue-600">{reward.requiredMiles.toLocaleString('id-ID')} Miles</p>
                      </div>
                      <button 
                        onClick={() => handleOpenRedeemModal(reward)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
                {catalog.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                    Saat ini tidak ada hadiah yang tersedia di katalog.
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: RIWAYAT REDEEM --- */}
            {activeTab === 'riwayat' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Waktu (Timestamp)</th>
                      <th className="px-6 py-4 font-semibold">Nama Hadiah</th>
                      <th className="px-6 py-4 font-semibold text-right">Miles Digunakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((hist) => (
                      <tr key={hist.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-xs text-gray-500">{hist.timestamp}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{hist.rewardName}</td>
                        <td className="px-6 py-4 text-right font-bold text-red-600">-{hist.milesUsed.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          Belum ada riwayat redeem.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </div>

      {/* --- MODAL KONFIRMASI REDEEM --- */}
      {isModalOpen && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Konfirmasi Redeem</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                  {errorMsg}
                </div>
              )}

              <p className="text-gray-600 text-sm">Anda akan menukarkan miles Anda untuk hadiah berikut:</p>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <p className="font-bold text-blue-900 text-lg mb-1">{selectedReward.name}</p>
                <p className="text-sm text-blue-700 mb-3">Oleh: {selectedReward.provider}</p>
                <div className="flex justify-between items-center border-t border-blue-200 pt-3">
                  <span className="text-sm font-medium text-gray-600">Miles Dipotong:</span>
                  <span className="font-bold text-red-600 text-lg">-{selectedReward.requiredMiles.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 text-center border border-gray-200">
                Sisa saldo Anda setelah transaksi ini: <br/>
                <span className="font-bold text-gray-900 text-lg mt-1 block">
                  {((user.awardMiles || 0) - selectedReward.requiredMiles).toLocaleString('id-ID')} Miles
                </span>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                disabled={isProcessing}
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button 
                disabled={isProcessing}
                onClick={handleConfirmRedeem} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}