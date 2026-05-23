'use client';
import { useState, useEffect } from 'react';

type Mitra = {
    email_mitra: string;
    nama_mitra: string;
    tanggal_kerja_sama: string;
    id_penyedia: string;
};

export default function Page() {
    const [createOpen, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Mitra | null>(null); // row being edited/deleted
    const [data, setData] = useState<Mitra[]>([]);

    const formatDate = (d: Date) =>
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);

    useEffect(() => {
        fetchMitra();
    }, []);

    async function fetchMitra() {
        try {
            const res = await fetch('/api/staff/partners');
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            {/* Dashboard */}
            <div className="max-w-7xl mx-auto text-gray-900">
                {/* Header */}
                <div className="flex flex-col md:flex-row space-x-8 space-y-2 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Kelola Mitra
                    </h1>

                    <button
                        onClick={() => setOpen(true)}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        Tambah Mitra +
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="table bg-white rounded-lg shadow-md p-6">
                        <thead>
                            <tr>
                                <th scope="col">Email</th>
                                <th scope="col">Nama Mitra</th>
                                <th scope="col">Tanggal Kerja Sama</th>
                                <th scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry, idx) => (<tr key={idx} className="hover:bg-base-300">
                                <td>{entry.email_mitra}</td>
                                <td>{entry.nama_mitra}</td>
                                <td>{formatDate(new Date(entry.tanggal_kerja_sama))}</td>
                                <td>
                                    <div className="flex space-x-2"><a
                                        className="text-blue-700 cursor-pointer"
                                        onClick={() => {
                                            setSelected(entry);
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
                        Tambah Mitra
                    </h3>

                    <form
                        method="dialog"
                        className="space-y-3"
                        onSubmit={async (e) => {
                            e.preventDefault();

                            const formElement = e.currentTarget;
                            const form = new FormData(formElement);

                            const body = {
                                email_mitra: form.get('email'),
                                nama_mitra: form.get('nama'),
                                tanggal_kerja_sama: form.get('start'),
                            };

                            const res = await fetch('/api/staff/partners', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(body),
                            });

                            if (res.ok) {
                                await fetchMitra();
                                formElement.reset();
                                setOpen(false);
                            }
                        }}
                    >

                        <input
                            name="email"
                            className="input input-bordered w-full"
                            placeholder="Email"
                            required
                        />

                        <input
                            name="nama"
                            className="input input-bordered w-full"
                            placeholder="Nama Mitra"
                            required
                        />

                        <input
                            name="start"
                            type="date"
                            className="input input-bordered w-full"
                            required
                        />

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

                    <h3 className="font-bold text-lg mb-4">Edit Mitra</h3>

                    {selected && (
                        <form
                            key={selected.id_penyedia}
                            className="space-y-3"
                            onSubmit={async (e) => {
                                e.preventDefault();

                                const formElement = e.currentTarget;
                                const form = new FormData(formElement);

                                const updated = {
                                    nama_mitra: form.get('nama'),
                                    tanggal_kerja_sama: form.get('start'),
                                };

                                const res = await fetch(`/api/staff/partners/${selected?.id_penyedia}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(updated),
                                });

                                console.log(await res.json());

                                if (res.ok) {
                                    await fetchMitra();
                                    formElement.reset();
                                    setEditOpen(false);
                                }
                            }}
                        >
                            <input
                                name="email"
                                defaultValue={selected.email_mitra}
                                className="input input-bordered w-full"
                                disabled
                            />

                            <input
                                name="nama"
                                defaultValue={selected.nama_mitra}
                                className="input input-bordered w-full"
                                required
                            />

                            <input
                                name="start"
                                type="date"
                                defaultValue={formatDate(new Date(selected.tanggal_kerja_sama))}
                                className="input input-bordered w-full"
                                required
                            />

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
                    <h3 className="font-bold text-lg">Hapus Mitra?</h3>
                    <p className="py-2">
                        {selected?.nama_mitra}
                    </p>

                    <div className="modal-action">
                        <button className="btn" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-error"
                            onClick={async () => {
                                if (!selected) return;

                                const res = await fetch(
                                    `/api/staff/partners/${selected.id_penyedia}`,
                                    {
                                        method: 'DELETE',
                                    }
                                );

                                if (res.ok) {
                                    await fetchMitra();

                                    setDeleteOpen(false);
                                    setSelected(null);
                                } else {
                                    const err = await res.json();
                                    alert(err.error ?? 'Failed to delete mitra');
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
        </div >
    );
}
