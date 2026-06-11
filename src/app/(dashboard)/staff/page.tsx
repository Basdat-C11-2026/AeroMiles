import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth"; // Sesuaikan dengan path utilitas auth-mu

export default async function StaffDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const decoded = await verifyToken(session.value);
  const userEmail = decoded?.email;

  if (!userEmail || decoded?.role?.toLowerCase() !== "staf") {
    redirect("/unauthorized"); 
  }

  const staffQuery = `
    SELECT 
      p.salutation, p.first_mid_name, p.last_name, p.email, p.country_code, 
      p.mobile_number, p.kewarganegaraan, p.tanggal_lahir,
      s.id_staf, s.kode_maskapai,
      m.nama_maskapai
    FROM pengguna p
    JOIN staf s ON p.email = s.email
    LEFT JOIN maskapai m ON s.kode_maskapai = m.kode_maskapai
    WHERE p.email = $1
  `;
  const { rows: staffRows } = await pool.query(staffQuery, [userEmail]);
  const user = staffRows[0];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Data profil staf tidak ditemukan.</p>
      </div>
    );
  }

  const pendingQuery = `
    SELECT count(*) as total_pending 
    FROM claim_missing_miles 
    WHERE status_penerimaan = 'Menunggu'
  `;
  const { rows: pendingRows } = await pool.query(pendingQuery);
  const totalPending = parseInt(pendingRows[0]?.total_pending || "0", 10);

  const handledQuery = `
    SELECT status_penerimaan, count(*) as jumlah 
    FROM claim_missing_miles 
    WHERE email_staf = $1 AND status_penerimaan IN ('Disetujui', 'Ditolak')
    GROUP BY status_penerimaan
  `;
  const { rows: handledRows } = await pool.query(handledQuery, [userEmail]);
  
  const totalApproved = parseInt(handledRows.find(r => r.status_penerimaan === 'Disetujui')?.jumlah || "0", 10);
  const totalRejected = parseInt(handledRows.find(r => r.status_penerimaan === 'Ditolak')?.jumlah || "0", 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Dashboard */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🧑‍💼 Workspace Staf AeroMiles</h1>
            <p className="text-gray-600">Selamat bekerja, {user.first_mid_name}! Berikut adalah ringkasan tugas dan profil Anda.</p>
          </div>

          {/* Grid Informasi Profil & Penugasan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kartu Informasi Penugasan (Diselaraskan dengan tema warna utama Navbar) */}
            <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.01] transition-transform duration-200">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wider">ID Staf</p>
                    <h2 className="text-2xl font-mono font-extrabold tracking-tight mt-1">{user.id_staf}</h2>
                  </div>
                  <span className="text-3xl">🏢</span>
                </div>
                
                <div className="space-y-4 border-t border-blue-500/50 pt-4">
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wider">Maskapai Penugasan</p>
                    <p className="text-xl font-bold tracking-wide mt-1">{user.nama_maskapai || "Tidak diketahui"}</p>
                    <p className="text-sm text-blue-300 font-mono mt-0.5">Kode: {user.kode_maskapai}</p>
                  </div>
                </div>
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
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <Link href="/profile" className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-55 rounded-lg transition">
                  ⚙️ Pengaturan Profil
                </Link>
              </div>
            </div>

          </div>

          {/* Bagian Ringkasan Metrik Klaim */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">📊 Ringkasan Klaim Missing Miles</h3>
                <p className="text-sm text-gray-500 mt-1">Status tiket dan miles yang membutuhkan atau telah melalui penanganan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Metrik: Menunggu (Global) */}
              <div className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                <div>
                  <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">Perlu Ditangani (Global)</p>
                  <h4 className="text-3xl font-extrabold text-gray-900">{totalPending}</h4>
                  <p className="text-xs text-gray-500 mt-1">Total klaim status "Menunggu"</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full text-2xl">⏳</div>
              </div>

              {/* Metrik: Disetujui (Personal) */}
              <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Disetujui Oleh Anda</p>
                  <h4 className="text-3xl font-extrabold text-gray-900">{totalApproved}</h4>
                  <p className="text-xs text-gray-500 mt-1">Riwayat klaim valid</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full text-2xl">✅</div>
              </div>

              {/* Metrik: Ditolak (Personal) */}
              <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Ditolak Oleh Anda</p>
                  <h4 className="text-3xl font-extrabold text-gray-900">{totalRejected}</h4>
                  <p className="text-xs text-gray-500 mt-1">Riwayat klaim tidak valid</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full text-2xl">❌</div>
              </div>
            </div>
            
            {/* Tombol Aksi Utama (Disamakan dengan gradasi Navbar) */}
            <div className="mt-6 text-right">
              <Link href="/staff/claims" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-95 text-white font-medium rounded-lg shadow-md transition">
                Buka Manajemen Klaim →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}