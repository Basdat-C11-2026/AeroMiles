import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth"; 

export default async function MemberDashboardPage() {
  // 1. Validasi Sesi Pengguna
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const decoded = await verifyToken(session.value);
  const userEmail = decoded?.email;

  if (!userEmail || decoded?.role?.toLowerCase() !== "member") {
    redirect("/unauthorized"); // Atau tampilkan halaman akses ditolak
  }

  const memberQuery = `
    SELECT 
      p.salutation, p.first_mid_name, p.last_name, p.email, p.country_code, 
      p.mobile_number, p.kewarganegaraan, p.tanggal_lahir,
      m.nomor_member, m.id_tier, m.total_miles, m.award_miles, m.tanggal_bergabung
    FROM pengguna p
    JOIN member m ON p.email = m.email
    WHERE p.email = $1
  `;
  const { rows: memberRows } = await pool.query(memberQuery, [userEmail]);
  const user = memberRows[0];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Data profil member tidak ditemukan.</p>
      </div>
    );
  }

  const historyQuery = `
    SELECT * FROM (
      SELECT 
        'Transfer Keluar' as jenis, 
        timestamp, 
        jumlah as miles, 
        catatan as deskripsi 
      FROM transfer WHERE email_member_1 = $1
      
      UNION ALL
      
      SELECT 
        'Transfer Masuk' as jenis, 
        timestamp, 
        jumlah as miles, 
        catatan as deskripsi 
      FROM transfer WHERE email_member_2 = $1
      
      UNION ALL
      
      SELECT 
        'Redeem Hadiah' as jenis, 
        timestamp, 
        NULL as miles, 
        kode_hadiah as deskripsi 
      FROM redeem WHERE email_member = $1
    ) AS gabungan_transaksi
    ORDER BY timestamp DESC
    LIMIT 5
  `;
  const { rows: transactions } = await pool.query(historyQuery, [userEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Dashboard */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">👋 Selamat Datang, {user.first_mid_name}!</h1>
            <p className="text-gray-600">Berikut adalah ringkasan informasi akun dan aktivitas program loyalitas Anda.</p>
          </div>

          {/* Grid Informasi Utama */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kartu Status Keanggotaan (Disamakan persis dengan gradasi warna utama Navbar) */}
            <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.01] transition-transform duration-200">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wider">Tier Anggota</p>
                    <h2 className="text-3xl font-extrabold tracking-tight mt-1">{user.id_tier}</h2>
                  </div>
                  <span className="text-3xl">✈️</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wider">Nomor Anggota</p>
                    <p className="text-lg font-mono font-bold tracking-wide">{user.nomor_member}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                    <div>
                      <p className="text-xs text-blue-200 uppercase">Total Miles</p>
                      <p className="text-xl font-bold">{user.total_miles.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-200 uppercase">Award Miles</p>
                      <p className="text-xl font-bold">{user.award_miles.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 text-xs text-blue-200 flex justify-between">
                <span>Bergabung Sejak:</span>
                <span className="font-medium">{new Date(user.tanggal_bergabung).toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            {/* Kartu Informasi Pribadi (Umum) */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">📋 Informasi Pribadi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Nama Lengkap</p>
                    <p className="text-gray-800 font-medium mt-0.5">
                      {user.salutation} {user.first_mid_name} {user.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Email Terdaftar</p>
                    <p className="text-gray-800 font-medium mt-0.5">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Nomor Handphone</p>
                    <p className="text-gray-800 font-medium mt-0.5">
                      ({user.country_code}) {user.mobile_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Kewarganegaraan</p>
                    <p className="text-gray-800 font-medium mt-0.5">{user.kewarganegaraan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Tanggal Lahir</p>
                    <p className="text-gray-800 font-medium mt-0.5">
                      {new Date(user.tanggal_lahir).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Link href="/member/profile" className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  ⚙️ Pengaturan Profil
                </Link>
              </div>
            </div>

          </div>

          {/* Bagian Riwayat Aktivitas Penerbangan & Transaksi */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">🕒 5 Transaksi Miles Terbaru</h3>
                <p className="text-xs text-gray-500 mt-0.5">Aktivitas penukaran hadiah maupun transfer dana miles Anda.</p>
              </div>
              <div className="flex gap-2">
                <Link href="/member/transfers" className="text-xs font-semibold bg-white text-blue-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition">
                  Transfer Miles
                </Link>
                {/* Tombol pemicu utama disesuaikan menggunakan kecerahan warna yang seirama */}
                <Link href="/member/redeem" className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-95 text-white px-3 py-1.5 rounded-md shadow-sm transition">
                  Tukarkan Hadiah
                </Link>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-base italic">Belum ada riwayat aktivitas transaksi miles pada akun Anda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-700">Waktu Transaksi</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Jenis Aktivitas</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Keterangan / Deskripsi</th>
                      <th className="px-6 py-3 font-semibold text-gray-700 text-right">Jumlah Miles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((trx, index) => {
                      const isNegative = trx.jenis === "Transfer Keluar" || trx.jenis === "Redeem Hadiah";
                      return (
                        <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(trx.timestamp).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              trx.jenis === "Transfer Masuk" 
                                ? "bg-green-100 text-green-700 border border-green-200" 
                                : trx.jenis === "Transfer Keluar"
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : "bg-purple-100 text-purple-700 border border-purple-200"
                            }`}>
                              {trx.jenis}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{trx.deskripsi}</td>
                          <td className={`px-6 py-4 font-bold text-right ${isNegative ? "text-red-600" : "text-green-600"}`}>
                            {trx.miles ? `${isNegative ? "-" : "+"}${trx.miles.toLocaleString("id-ID")}` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}