import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export default async function InfoTier() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const decoded = await verifyToken(session.value);
  const userEmail = decoded?.email;

  if (!userEmail || decoded?.role?.toLowerCase() !== "member") {
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

  const memberQuery = await pool.query(
    'SELECT id_tier, total_miles FROM member WHERE email = $1', 
    [userEmail]
  );
  const userData = memberQuery.rows[0];

  const tierQuery = await pool.query('SELECT * FROM tier ORDER BY minimal_tier_miles ASC');
  const tiers = tierQuery.rows;

  const getUIConfig = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('blue')) return { colorClass: 'text-blue-600', bgClass: 'bg-blue-50 border-blue-200' };
    if (name.includes('silver')) return { colorClass: 'text-slate-600', bgClass: 'bg-slate-50 border-slate-300' };
    if (name.includes('gold')) return { colorClass: 'text-amber-600', bgClass: 'bg-amber-50 border-amber-300' };
    if (name.includes('platinum')) return { colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50 border-indigo-200' };
    return { colorClass: 'text-gray-600', bgClass: 'bg-gray-50 border-gray-200' }; 
  };

  const currentTierIndex = tiers.findIndex(t => t.id_tier === userData?.id_tier);
  const nextTier = tiers[currentTierIndex + 1];
  const currentMiles = userData?.total_miles || 0;
  const milesToNextTier = nextTier ? Math.max(0, nextTier.minimal_tier_miles - currentMiles) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Informasi Tier Membership</h1>
          <p className="text-gray-600 text-sm">Pelajari berbagai syarat untuk mencapai tingkatan eksklusif AeroMiles.</p>
          
          <div className="mt-6 p-4 bg-gray-900 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white text-center md:text-left">
              <p className="text-sm text-gray-400">Tier Anda saat ini:</p>
              <p className="text-3xl font-bold">{userData?.id_tier || 'Tidak diketahui'}</p>
            </div>
            
            {nextTier ? (
              <div className="text-center md:text-right bg-gray-800 p-3 rounded border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Dibutuhkan untuk mencapai <span className="font-bold text-white">{nextTier.nama}</span>:</p>
                <p className="text-lg font-bold text-blue-400">{milesToNextTier.toLocaleString('id-ID')} Tier Miles</p>
              </div>
            ) : (
              <div className="text-center bg-gradient-to-r from-amber-500 to-yellow-500 p-3 rounded">
                <p className="text-sm font-bold text-white">🎉 Anda berada di Tier Tertinggi!</p>
              </div>
            )}
          </div>
        </div>

        {/* Daftar Tier */}
        <div className="space-y-4">
          {tiers.map((tier, idx) => {
            const isCurrentTier = tier.id_tier === userData?.id_tier;
            const uiConfig = getUIConfig(tier.nama);
            
            return (
              <div 
                key={idx} 
                className={`relative overflow-hidden rounded-xl border-2 transition-all ${uiConfig.bgClass} ${isCurrentTier ? 'ring-2 ring-blue-500 ring-offset-2 transform scale-[1.01] shadow-md' : 'shadow-sm opacity-90'}`}
              >
                {isCurrentTier && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    TIER ANDA SAAT INI
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row">
                  {/* Bagian Kiri (Syarat dari DB) */}
                  <div className="p-6 md:w-1/2 flex flex-col justify-center bg-white/40">
                    <h2 className={`text-3xl font-black mb-4 ${uiConfig.colorClass}`}>{tier.nama}</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Minimal Frekuensi Terbang</p>
                        <p className="font-bold text-gray-900 text-xl">{tier.minimal_frekuensi_terbang} Kali</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Minimal Total Miles</p>
                        <p className="font-bold text-gray-900 text-xl">{tier.minimal_tier_miles.toLocaleString('id-ID')} Miles</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bagian Kanan (Keuntungan) */}
                  <div className="p-6 md:w-1/2 bg-white/80 border-l border-white">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Keuntungan Utama:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-sm text-gray-700">Persyaratan tercapai pada <strong>{tier.minimal_tier_miles.toLocaleString('id-ID')} Total Miles</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-sm text-gray-700">Dapatkan keuntungan eksklusif tambahan saat naik ke tier <strong>{tier.nama}</strong>.</span>
                      </li>
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