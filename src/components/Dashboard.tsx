'use client';

export default function Dashboard() {
  const user = {
    name: 'John Doe',
    milesBalance: 245850,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Selamat datang kembali, {user.name}! ✈️
          </h1>
          <p className="text-gray-600">Kelola poin reward dan terbang lebih jauh bersama AeroMiles</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Miles Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Miles</p>
                <p className="text-3xl font-bold text-blue-600" suppressHydrationWarning>{user.milesBalance.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">+2,450 bulan ini</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
            </div>
          </div>

          {/* Tier Level Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Tier Level</p>
                <p className="text-3xl font-bold text-amber-600">Gold</p>
                <p className="text-xs text-blue-600 mt-2">Kurang 5,000 ke Platinum</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>

          {/* Recent Flights Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Penerbangan Bulan Ini</p>
                <p className="text-3xl font-bold text-indigo-600">8</p>
                <p className="text-xs text-green-600 mt-2">+3 dari bulan lalu</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛫</span>
              </div>
            </div>
          </div>

          {/* Rewards Available Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Reward Tersedia</p>
                <p className="text-3xl font-bold text-green-600">12</p>
                <p className="text-xs text-amber-600 mt-2">Lihat penawaran terbaru</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Aktivitas Terbaru</h2>
            <div className="space-y-4">
              {[
                { date: '28 Apr 2024', flight: 'Jakarta → Bali', miles: '+1,250', status: 'Selesai' },
                { date: '25 Apr 2024', flight: 'Bali → Jakarta', miles: '+1,250', status: 'Selesai' },
                { date: '20 Apr 2024', flight: 'Jakarta → Surabaya', miles: '+850', status: 'Selesai' },
                { date: '15 Apr 2024', flight: 'Surabaya → Jakarta', miles: '+850', status: 'Selesai' },
                { date: '10 Apr 2024', flight: 'Jakarta → Medan', miles: '+1,500', status: 'Selesai' },
              ].map((transaction, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.flight}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{transaction.miles}</p>
                    <p className="text-xs text-gray-500">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Lihat Semua Transaksi
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Aksi Cepat</h2>
            <div className="space-y-3">
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all transform hover:scale-105">
                🛫 Cari Penerbangan
              </button>
              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all transform hover:scale-105">
                🎁 Tukar Reward
              </button>
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105">
                📊 Lihat Laporan
              </button>
              <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all transform hover:scale-105">
                ⭐ Tier Benefits
              </button>
            </div>

            {/* Promo Banner */}
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg border border-pink-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">🎉 Penawaran Spesial</p>
              <p className="text-xs text-gray-700 mb-3">Dapatkan bonus 500 miles untuk setiap penerbangan di Mei!</p>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Pelajari Lebih Lanjut →
              </button>
            </div>
          </div>
        </div>

        {/* Tier Benefits Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manfaat Tier Anda (Gold)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: '1.5x Miles', desc: 'Kalikan poin reward Anda' },
              { title: 'Priority Check-in', desc: 'Tidak perlu antri lama' },
              { title: 'Bagasi Gratis', desc: '2 bagasi check-in' },
              { title: 'Lounge Access', desc: 'Akses eksklusif lounge' },
            ].map((benefit, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <p className="font-semibold text-gray-900 mb-2">{benefit.title}</p>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
