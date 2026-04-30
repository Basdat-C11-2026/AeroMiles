'use client';
import { useState } from 'react';

type Reward = {
    kode: string;
    nama: string;
    deskripsi: string;
    penyedia: string;
    miles: number;
    start: Date;
    end: Date;
};

export default function Dashboard() {
    const [createOpen, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Reward | null>(null); // row being edited/deleted
    const [data, setData] = useState<Reward[]>([{
        kode: 'RWD-001',
        nama: 'Tiket Domestik PP',
        deskripsi: '...',
        penyedia: 'Garuda Indonesia',
        miles: 15000,
        start: new Date(2024, 0, 1),
        end: new Date(2025, 11, 31),
    },
    {
        kode: 'RWD-002',
        nama: 'Upgrade ke Business Class',
        deskripsi: '...',
        penyedia: 'Garuda Indonesia',
        miles: 25000,
        start: new Date(2024, 0, 1),
        end: new Date(2025, 11, 31),
    },
    {
        kode: 'RWD-003',
        nama: 'Voucher Hotel Rp 500.000',
        deskripsi: '...',
        penyedia: 'TravelokaPartner',
        miles: 8000,
        start: new Date(2024, 5, 1),
        end: new Date(2025, 5, 30),
    },
    {
        kode: 'RWD-004',
        nama: 'Akses Lounge 1x',
        deskripsi: '...',
        penyedia: 'Plaza Premium',
        miles: 3000,
        start: new Date(2024, 0, 1),
        end: new Date(2025, 11, 31),
    },
    ]);
    const penyediaList = ['Garuda Indonesia', 'TravelokaPartner', 'Plaza Premium'];
    const [penyedia, setPenyedia] = useState("");
    const [kodeCounter, setKodeCounter] = useState(data.length + 1);

    const formatDate = (d: Date) =>
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);

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
                                <td>
                                    {formatDate(entry.start)} — {formatDate(entry.end)}</td>
                                <td>
                                    <div className="flex space-x-2"><a
                                        className="text-blue-700 cursor-pointer"
                                        onClick={() => {
                                            setSelected(entry);
                                            setPenyedia(entry.penyedia);
                                            setEditOpen(true);
                                        }}
                                    >
                                        Edit
                                    </a>

                                        <a
                                            className="text-red-700 cursor-pointer"
                                            onClick={() => {
                                                setSelected(entry);
                                                setDeleteOpen(true);
                                            }}
                                        >
                                            Delete
                                        </a>
                                    </div>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Form Modal */}
            <dialog className={`modal ${createOpen ? 'modal-open' : ''}`}>
                <div className="modal-box bg-base-100 text-base-content">

                    <h3 className="font-bold text-lg mb-4">
                        Tambah Hadiah
                    </h3>

                    <form
                        method="dialog"
                        className="space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();

                            const form = new FormData(e.target);

                            const newEntry = {
                                kode: `RWD-${String(kodeCounter).padStart(3, '0')}`,
                                nama: String(form.get('nama')) ?? '',
                                deskripsi: String(form.get('deskripsi')) ?? '',
                                penyedia: String(form.get('penyedia')) ?? '',
                                miles: Number(form.get('miles')),
                                start: new Date(String(form.get('start'))),
                                end: new Date(String(form.get('end'))),
                            };

                            setData(prev => [...prev, newEntry]);
                            setKodeCounter(prev => prev + 1);

                            e.target.reset();        // reset form
                            setPenyedia("");         // reset controlled select (if using it)
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

                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setOpen(false)}>close</button>
                </form>
            </dialog >

            {/* Edit Form */}
            <dialog className={`modal ${editOpen ? 'modal-open' : ''}`}>
                <div className="modal-box">

                    <h3 className="font-bold text-lg mb-4">Edit Hadiah</h3>

                    {selected && (
                        <form
                            className="space-y-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = new FormData(e.target);

                                const updated = {
                                    ...selected,
                                    nama: String(form.get('nama') ?? ''),
                                    deskripsi: String(form.get('deskripsi') ?? ''),
                                    penyedia: String(form.get('penyedia') ?? ''),
                                    miles: Number(form.get('miles')),
                                    start: new Date(String(form.get('start'))),
                                    end: new Date(String(form.get('end'))),
                                };

                                setData(prev =>
                                    prev.map(item =>
                                        item.kode === selected.kode ? updated : item
                                    )
                                );

                                setEditOpen(false);
                                setSelected(null);
                            }}
                        >
                            <input
                                className="input input-bordered w-full"
                                value={selected.kode}
                                disabled
                            />

                            <input
                                name="nama"
                                defaultValue={selected.nama}
                                className="input input-bordered w-full"
                                required
                            />

                            <input
                                name="deskripsi"
                                defaultValue={selected.deskripsi}
                                className="input input-bordered w-full"
                            />

                            <select
                                name="penyedia"
                                className="select select-bordered w-full"
                                value={penyedia}
                                onChange={(e) => setPenyedia(e.target.value)}
                            >
                                {penyediaList.map((p, i) => (
                                    <option key={i} value={p}>{p}</option>
                                ))}
                            </select>

                            <input
                                name="miles"
                                type="number"
                                defaultValue={selected.miles}
                                className="input input-bordered w-full"
                                required
                            />

                            <div className="flex gap-2">
                                <input
                                    name="start"
                                    type="date"
                                    defaultValue={formatDate(selected.start)}
                                    className="input input-bordered w-full"
                                />
                                <input
                                    name="end"
                                    type="date"
                                    defaultValue={formatDate(selected.end)}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setEditOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setEditOpen(false)}>close</button>
                </form>
            </dialog>

            {/* Delete Confirmation */}
            <dialog className={`modal ${deleteOpen ? 'modal-open' : ''}`}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Hapus Hadiah?</h3>
                    <p className="py-2">
                        {selected?.nama}
                    </p>

                    <div className="modal-action">
                        <button className="btn" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-error"
                            onClick={() => {
                                setData(prev =>
                                    prev.filter(item => item.kode !== selected?.kode)
                                );
                                setDeleteOpen(false);
                                setSelected(null);
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setDeleteOpen(false)}>close</button>
                </form>
            </dialog>
        </div >
    );
}
