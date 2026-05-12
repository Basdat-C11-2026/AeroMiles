'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface TierInfo {
  name: string;
  minFlights: number;
  minMiles: number;
  benefits: string[];
  colorClass: string;
  bgClass: string;
}

const tierData: TierInfo[] = [
  {
    name: 'Blue',
    minFlights: 0,
    minMiles: 0,
    benefits: ['Perolehan miles standar', 'Akses prioritas call center'],
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-200'
  },
  {
    name: 'Silver',
    minFlights: 10,
    minMiles: 10000,
    benefits: ['Bonus 25% miles', 'Prioritas Check-in', '+5kg bagasi ekstra'],
    colorClass: 'text-slate-600',
    bgClass: 'bg-slate-50 border-slate-300'
  },
  {
    name: 'Gold',
    minFlights: 30,
    minMiles: 30000,
    benefits: ['Bonus 50% miles', 'Akses Executive Lounge', '+15kg bagasi ekstra', 'Prioritas Boarding'],
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-300'
  },
  {
    name: 'Platinum',
    minFlights: 50,
    minMiles: 50000,
    benefits: ['Bonus 100% miles', 'Akses First Class Lounge', '+25kg bagasi ekstra', 'Gratis Upgrade Kelas (Jika tersedia)'],
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50 border-indigo-200'
  }
];

export default function InfoTier() {
  const { user } = useAuth();

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

  const currentTierIndex = tierData.findIndex(t => t.name === user.tier);
  const nextTier = tierData[currentTierIndex + 1];
  
  // Kalkulasi selisih miles untuk naik tier (Asumsi menggunakan totalMiles)
  const currentMiles = user.totalMiles || 0;
  const milesToNextTier = nextTier ? Math.max(0, nextTier.minMiles - currentMiles) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Informasi Tier Membership</h1>
          <p className="text-gray-600 text-sm">Pelajari berbagai keuntungan eksklusif di setiap tingkatan AeroMiles.</p>
          
          <div className="mt-6 p-4 bg-gray-900 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white">
              <p className="text-sm text-gray-400">Tier Anda saat ini:</p>
              <p className="text-3xl font-bold">{user.tier}</p>
            </div>
            
            {nextTier ? (
              <div className="text-right bg-gray-800 p-3 rounded border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Dibutuhkan untuk mencapai <span className="font-bold text-white">{nextTier.name}</span>:</p>
                <p className="text-lg font-bold text-blue-400">{milesToNextTier.toLocaleString()} Tier Miles</p>
              </div>
            ) : (
              <div className="text-right bg-gradient-to-r from-amber-500 to-yellow-500 p-3 rounded">
                <p className="text-sm font-bold text-white">🎉 Anda berada di Tier Tertinggi!</p>
              </div>
            )}
          </div>
        </div>

        {/* Daftar Tier */}
        <div className="space-y-4">
          {tierData.map((tier, idx) => {
            const isCurrentTier = tier.name === user.tier;
            return (
              <div 
                key={idx} 
                className={`relative overflow-hidden rounded-xl border-2 transition-all ${tier.bgClass} ${isCurrentTier ? 'ring-2 ring-blue-500 ring-offset-2 transform scale-[1.01] shadow-md' : 'shadow-sm opacity-90'}`}
              >
                {isCurrentTier && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    TIER ANDA SAAT INI
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row">
                  {/* Bagian Kiri (Syarat) */}
                  <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200/50 md:w-1/3 flex flex-col justify-center">
                    <h2 className={`text-3xl font-black mb-4 ${tier.colorClass}`}>{tier.name}</h2>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Minimal Frekuensi Terbang</p>
                        <p className="font-bold text-gray-900">{tier.minFlights} Penerbangan</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Minimal Tier Miles</p>
                        <p className="font-bold text-gray-900">{tier.minMiles.toLocaleString()} Miles</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bagian Kanan (Keuntungan) */}
                  <div className="p-6 md:w-2/3 bg-white/60">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Keuntungan Utama:</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tier.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}