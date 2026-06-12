'use client';
import { useEffect, useState } from 'react';

type Reward = {
    kode_hadiah: string;
    nama: string;
    deskripsi: string;
    id_penyedia: string;
    miles: string;
    valid_start_date: string;
    program_end: string;
    penyedia_nama: string;
};

type Penyedia = {
    id_penyedia: string;
    nama: string;
};

export default function Page() {
    const [createOpen, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Reward | null>(null);
    const [data, setData] = useState<Reward[]>([]);
    const [penyediaList, setPenyediaList] = useState<Penyedia[]>([]);
    const [idPenyedia, setIdPenyedia] = useState<string>("");
    const [filterPenyedia, setFilterPenyedia] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const isExpired = (end: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(end) < today;
    };

    const filteredData = data.filter((item) => {
        const matchPenyedia = filterPenyedia === '' || item.id_penyedia === filterPenyedia;

        let matchStatus = true;
        if (filterStatus === 'aktif') matchStatus = !isExpired(item.program_end);
        if (filterStatus === 'expired') matchStatus = isExpired(item.program_end);

        return matchPenyedia && matchStatus;
    });

    const formatDate = (d: Date) =>
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);

    const isValidDateRange = (start: string, end: string) => {
        return new Date(start) <= new Date(end);
    };

    useEffect(() => {
        fetchRewards();
        fetchPenyedia();
    }, []);

    async function fetchRewards() {
        try {
            const res = await fetch('/api/staff/rewards');
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchPenyedia() {
        const res = await fetch('/api/lookups/provider');
        const json = await res.json();
        setPenyediaList(json);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            {/* Dashboard */}
            <div className="max-w-7xl mx-auto text-gray-900">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row space-x-8 space-y-2 mb-6 items-center justify-between">
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

                {/* Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Filter Penyedia</label>
                        <select
                            className="select select-bordered w-full text-sm"
                            value={filterPenyedia}
                            onChange={(e) => setFilterPenyedia(e.target.value)}
                        >
                            <option value="">Semua Penyedia</option>
                            {penyediaList.map((p) => (
                                <option key={p.id_penyedia} value={p.id_penyedia}>
                                    {p.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status Keaktifan</label>
                        <select
                            className="select select-bordered w-full text-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="aktif">Masih Aktif</option>
                            <option value="expired">Sudah Expired</option>
                        </select>
                    </div>
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
                            {filteredData.map((entry, idx) => (<tr key={idx} className="hover:bg-base-300">
                                <td>{entry.kode_hadiah}</td>
                                <td>{entry.nama}</td>
                                <td>{entry.deskripsi}</td>
                                <td>{entry.penyedia_nama}</td>
                                <td>{entry.miles}</td>
                                <td>
                                    {formatDate(new Date(entry.valid_start_date))} — {formatDate(new Date(entry.program_end))}
                                </td>
                                <td>
                                    <div className="flex space-x-2"><button
                                        type="button"
                                        className="text-blue-700 cursor-pointer"
                                        onClick={() => {
                                            setSelected(entry);
                                            setIdPenyedia(entry.id_penyedia);
                                            setEditOpen(true);
                                        }}
                                    >
                                        Edit
                                    </button>

                                        <button
                                            type="button"
                                            disabled={!isExpired(entry.program_end)}
                                            className={`cursor-pointer ${isExpired(entry.program_end)
                                                ? 'text-red-700 hover:text-red-800'
                                                : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                            onClick={() => {
                                                setSelected(entry);
                                                setDeleteOpen(true);
                                            }}
                                            title={!isExpired(entry.program_end) ? "Hadiah masih aktif" : "Hapus hadiah"}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>))}
                            
                            {/* Pesan jika data filter kosong */}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada hadiah yang sesuai dengan kriteria filter.
                                    </td>
                                </tr>
                            )}
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
                        onSubmit={async (e) => {
                            e.preventDefault();

                            const formElement = e.currentTarget;
                            const form = new FormData(formElement);

                            const body = {
                                nama: form.get('nama'),
                                deskripsi: form.get('deskripsi'),
                                miles: Number(form.get('miles')),
                                valid_start_date: form.get('start'),
                                program_end: form.get('end'),
                                id_penyedia: form.get('penyedia'),
                            };

                            if (!isValidDateRange(
                                String(body.valid_start_date),
                                String(body.program_end)
                            )) {
                                alert('Tanggal akhir harus setelah atau sama dengan tanggal mulai.');
                                return;
                            }

                            const res = await fetch('/api/staff/rewards', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(body),
                            });

                            if (res.ok) {
                                await fetchRewards();
                                formElement.reset();
                                setIdPenyedia("");
                                setOpen(false);
                            }
                        }}
                    >
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
                            className={`select select-bordered w-full  ${!idPenyedia ? 'text-gray-400' : 'text-base-content'}`}
                            required
                            defaultValue=""
                            onChange={(e) => setIdPenyedia(e.target.value)}
                        >
                            <option disabled hidden value="">Pilih Penyedia</option>
                            {penyediaList.map((p) => (
                                <option
                                    key={p.id_penyedia}
                                    value={p.id_penyedia}
                                >
                                    {p.nama}
                                </option>
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
                                required
                            />
                            <input
                                name="end"
                                type="date"
                                className="input input-bordered w-full"
                                required
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
            </dialog>

            {/* Edit Form */}
            <dialog className={`modal ${editOpen ? 'modal-open' : ''}`}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Edit Hadiah</h3>

                    {selected && (
                        <form
                            key={selected.id_penyedia}
                            className="space-y-3"
                            onSubmit={async (e) => {
                                e.preventDefault();

                                const form = new FormData(e.currentTarget);

                                const updated = {
                                    nama: form.get('nama'),
                                    deskripsi: form.get('deskripsi'),
                                    miles: Number(form.get('miles')),
                                    valid_start_date: form.get('start'),
                                    program_end: form.get('end'),
                                    id_penyedia: form.get('penyedia'),
                                };

                                if (!isValidDateRange(
                                    String(updated.valid_start_date),
                                    String(updated.program_end)
                                )) {
                                    alert('Tanggal akhir harus setelah atau sama dengan tanggal mulai.');
                                    return;
                                }

                                const res = await fetch(`/api/staff/rewards/${selected?.kode_hadiah}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(updated),
                                });

                                if (res.ok) {
                                    await fetchRewards();
                                    setEditOpen(false);
                                    setSelected(null);
                                }
                            }}
                        >
                            <input
                                className="input input-bordered w-full"
                                value={selected.kode_hadiah}
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
                                defaultValue={selected.id_penyedia}
                            >
                                {penyediaList.map((p) => (
                                    <option
                                        key={p.id_penyedia}
                                        value={p.id_penyedia}
                                    >
                                        {p.nama}
                                    </option>
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
                                    defaultValue={formatDate(new Date(selected.valid_start_date))}
                                    className="input input-bordered w-full"
                                    required
                                />
                                <input
                                    name="end"
                                    type="date"
                                    defaultValue={formatDate(new Date(selected.program_end))}
                                    className="input input-bordered w-full"
                                    required
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
                            onClick={async () => {
                                const res = await fetch(`/api/staff/rewards/${selected?.kode_hadiah}`, {
                                    method: 'DELETE',
                                });

                                if (res.ok) {
                                    await fetchRewards();
                                    setDeleteOpen(false);
                                    setSelected(null);
                                } else {
                                    const err = await res.json();
                                    alert(err.error || 'Gagal menghapus hadiah');
                                }
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
        </div>
    );
}