import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
    params: Promise<{
        provider_id: string;
    }>;
};

export async function POST(req: NextRequest, { params }: Params) {
    try {
        const { provider_id } = await params;
        const { email_mitra, nama_mitra, tanggal_kerja_sama } = await req.json();

        await pool.query(`
            UPDATE MITRA 
                SET
                    nama_mitra = $1,
                    tanggal_kerja_sama = $2
            WHERE
                id_penyedia = $3`,
            [nama_mitra, tanggal_kerja_sama, provider_id]
        );

        return NextResponse.json({ message: 'Mitra berhasil didaftarkan' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: Params
) {
    const client = await pool.connect();

    try {
        const { provider_id } = await params;

        await client.query('BEGIN');

        await client.query(
            `DELETE FROM HADIAH WHERE id_penyedia = $1`,
            [provider_id]
        );

        await client.query(
            `DELETE FROM MITRA WHERE id_penyedia = $1`,
            [provider_id]
        );

        await client.query(
            `DELETE FROM PENYEDIA WHERE id = $1`,
            [provider_id]
        );

        await client.query('COMMIT');

        return NextResponse.json({
            message: 'Mitra beserta hadiah yang disediakan berhasil dihapus',
        });
    } catch (error: any) {
        await client.query('ROLLBACK');
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}