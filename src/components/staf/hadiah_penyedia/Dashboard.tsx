'use client';
import { useState } from 'react';

export default function Dashboard() {
    const [open, setOpen] = useState(false);

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

    const penyediaList = ['Garuda Indonesia', 'TravelokaPartner', 'Plaza Premium'];
    const [penyedia, setPenyedia] = useState("");
    const [kodeCounter, setKodeCounter] = useState(5); // next after RWD-004

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            {/* Dashboard */}
            <div className="max-w-7xl mx-auto text-gray-900">
                {/* Header */}
                <div className="flex flex-col md:flex-row space-x-8 space-y-2 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Kelola Hadiah & Penyedia
                    </h1>

                    <button
                        onClick={() => setOpen(true)}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        Tambah Hadiah +
                    </button>
                </div>

                {/* Table */}
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

            {/* Create Form Modal */}
            <dialog className={`modal ${open ? 'modal-open' : ''}`}>
                <div className="modal-box bg-base-100 text-base-content">

                    <h3 className="font-bold text-lg mb-4">
                        Tambah Hadiah
                    </h3>

                    <form
                        method="dialog"
                        className="space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            // TODO: handle submit here
                            setKodeCounter(prev => prev + 1);
                            setOpen(false);
                        }}
                    >
                        <input
                            name="kode"
                            className="input input-bordered w-full"
                            value={`RWD-${String(kodeCounter).padStart(3, '0')}`}
                            disabled
                        />

                        <input
                            name="nama"
                            className="input input-bordered w-full"
                            placeholder="Nama"
                            required
                        />

                        <input
                            name="deskripsi"
                            className="input input-bordered w-full"
                            placeholder="Deskripsi"
                        />

                        <select
                            name="penyedia"
                            className={`select select-bordered w-full  ${!penyedia ? 'text-gray-400' : 'text-base-content'}`}
                            required
                            defaultValue=""
                            onChange={(e) => setPenyedia(e.target.value)}
                        >
                            <option disabled hidden value="">Pilih Penyedia</option>
                            {penyediaList.map((p, i) => (
                                <option key={i} value={p}>{p}</option>
                            ))}
                        </select>

                        <input
                            name="miles"
                            type="number"
                            className="input input-bordered w-full"
                            placeholder="Miles"
                            required
                        />

                        <div className="flex gap-2">
                            <input
                                name="start"
                                type="date"
                                className="input input-bordered w-full"
                            />
                            <input
                                name="end"
                                type="date"
                                className="input input-bordered w-full"
                            />
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>

                {/* backdrop */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setOpen(false)}>close</button>
                </form>
            </dialog >
        </div >
    );
}
