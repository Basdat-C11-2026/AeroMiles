'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface MilesPackage {
  id: string;
  name: string;
  milesAmount: number;
  price: number;
}

interface PurchaseHistory {
  id: string;
  packageId: string;
  packageName: string;
  milesAdded: number;
  pricePaid: number;
  timestamp: string;
}

const packagesCatalog: MilesPackage[] = [
  { id: 'PKG-1000', name: 'Starter Pack', milesAmount: 1000, price: 150000 },
  { id: 'PKG-5000', name: 'Traveler Pack', milesAmount: 5000, price: 700000 },
  { id: 'PKG-15000', name: 'Explorer Pack', milesAmount: 15000, price: 2000000 },
  { id: 'PKG-50000', name: 'Globetrotter Pack', milesAmount: 50000, price: 6000000 },
];

export default function BeliPackage() {
  const { user, updateProfile } = useAuth();
  
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'katalog' | 'riwayat'>('katalog');
  
  const [selectedPackage, setSelectedPackage] = useState<MilesPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Akses Guard
  if (user?.role !== 'member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full border-t-4 border-red-500">
          <span className="text-4xl mb-4 block">🚫</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Maaf, halaman ini hanya dapat diakses oleh Member AeroMiles.</p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleOpenBuyModal = (pkg: MilesPackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleConfirmBuy = async () => {
    if (!selectedPackage || !user) return;
    setIsProcessing(true);

    try {
      // Simulasi delay pembayaran
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAwardMiles = (user.awardMiles || 0) + selectedPackage.milesAmount;
      const newTotalMiles = (user.totalMiles || 0) + selectedPackage.milesAmount;
      
      await updateProfile({ 
        awardMiles: newAwardMiles,
        totalMiles: newTotalMiles
      });

      const newHistory: PurchaseHistory = {
        id: `INV-${Date.now()}`,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        milesAdded: selectedPackage.milesAmount,
        pricePaid: selectedPackage.price,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      
      setHistory([newHistory, ...history]);
      alert('Pembelian Paket Berhasil! Miles telah ditambahkan ke akun Anda.');
      setIsModalOpen(false);
      setActiveTab('riwayat');
    } catch (err) {
      alert('Terjadi kesalahan saat memproses pembelian.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Beli Package Miles</h1>
            <p className="text-sm text-gray-500 mt-1">Kurang miles untuk redeem hadiah impian? Beli paket miles sekarang.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Saldo Miles Saat Ini:</p>
            <p className="text-2xl font-bold text-blue-600">{(user.awardMiles || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('katalog')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'katalog' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            🛒 Katalog Paket
          </button>
          <button onClick={() => setActiveTab('riwayat')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'riwayat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            🧾 Riwayat Pembelian
          </button>
        </div>

        {/* TAB KATALOG */}
        {activeTab === 'katalog' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {packagesCatalog.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md hover:border-blue-300 transition-all transform hover:-translate-y-1">
                <div className="p-6 text-center border-b border-gray-50 bg-gradient-to-b from-blue-50 to-white">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 block">{pkg.id}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{pkg.name}</h3>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <p className="text-3xl font-black text-blue-600 mb-1">
                    {pkg.milesAmount.toLocaleString()} <span className="text-sm text-gray-500 font-medium">Miles</span>
                  </p>
                </div>
                <div className="p-6 bg-gray-50 mt-auto">
                  <p className="text-center text-gray-600 text-sm mb-4">Harga: <span className="font-bold text-gray-900">Rp {pkg.price.toLocaleString('id-ID')}</span></p>
                  <button 
                    onClick={() => handleOpenBuyModal(pkg)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Beli Paket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB RIWAYAT */}
        {activeTab === 'riwayat' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">ID Transaksi</th>
                  <th className="px-6 py-4 font-semibold">Nama Paket</th>
                  <th className="px-6 py-4 font-semibold text-right">Harga Dibayar</th>
                  <th className="px-6 py-4 font-semibold text-right">Miles Ditambahkan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((hist) => (
                  <tr key={hist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{hist.timestamp}</td>
                    <td className="px-6 py-4 font-mono text-gray-500">{hist.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{hist.packageName}</td>
                    <td className="px-6 py-4 text-right text-gray-600">Rp {hist.pricePaid.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">+{hist.milesAdded.toLocaleString()}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada riwayat pembelian.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL KONFIRMASI */}
      {isModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Konfirmasi Pembelian</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">Anda akan membeli paket miles berikut:</p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <p className="font-bold text-blue-900 text-lg">{selectedPackage.name}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200">
                  <span className="text-sm text-gray-600">Miles didapat:</span>
                  <span className="font-bold text-green-600">+{selectedPackage.milesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Total Harga:</span>
                  <span className="font-bold text-gray-900">Rp {selectedPackage.price.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button disabled={isProcessing} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Batal</button>
              <button disabled={isProcessing} onClick={handleConfirmBuy} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50">
                {isProcessing ? 'Memproses...' : 'Beli Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}