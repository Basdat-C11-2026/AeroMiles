'use client';

export default function Dashboard() {
    const user = {
        name: 'John Doe',
        milesBalance: 245850,
    };
    const data = [
        { kode: 'RWD-001', nama: 'Tiket Domestik PP', deskripsi: '...', penyedia: 'Garuda Indonesia', miles: 15000, periode: '2024-01-01 — 2025-12-31' },
        { kode: 'RWD-002', nama: 'Upgrade ke Business Class', deskripsi: '...', penyedia: 'Garuda Indonesia', miles: 25000, periode: '2024-01-01 — 2025-12-31' },
        { kode: 'RWD-003', nama: 'Voucher Hotel Rp 500.000', deskripsi: '...', penyedia: 'TravelokaPartner', miles: 8000, periode: '2024-06-01 — 2025-06-30' },
        { kode: 'RWD-004', nama: 'Akses Lounge 1x', deskripsi: '...', penyedia: 'Plaza Premium', miles: 3000, periode: '2024-01-01 — 2025-12-31' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                        Kelola Hadiah & Penyedia
                    </h1>
                </div>

                {/* Recent Transactions */}
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="table bg-white rounded-lg shadow-md p-6">
                        <thead>
                            <tr>
                                <th scope="col">Kode</th>
                                <th scope="col">Nama</th>
                                <th scope="col">Deskripsi</th>
                                <th scope="col">Penyedia</th>
                                <th scope="col">Miles</th>
                                <th scope="col">Periode</th>
                                <th scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry, idx) => (<tr key={idx} className="hover:bg-base-300">
                                <td>{entry.kode}</td>
                                <td>{entry.nama}</td>
                                <td>{entry.deskripsi}</td>
                                <td>{entry.penyedia}</td>
                                <td>{entry.miles}</td>
                                <td>{entry.periode}</td>
                                <td>
                                    <div className="flex space-x-2">
                                        <a href="#" className="text-blue-700">Edit</a>
                                        <a href="#" className="text-red-700">Delete</a>
                                    </div>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
