import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
    params: Promise<{
        kode: string;
    }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const { kode } = await params;

        const {
            nama,
            miles,
            deskripsi,
            valid_start_date,
            program_end,
            id_penyedia,
        } = await req.json();

        await pool.query(
            `
            UPDATE HADIAH
            SET
                nama = $1,
                miles = $2,
                deskripsi = $3,
                valid_start_date = $4,
                program_end = $5,
                id_penyedia = $6
            WHERE kode_hadiah = $7
            `,
            [
                nama,
                miles,
                deskripsi,
                valid_start_date,
                program_end,
                id_penyedia,
                kode,
            ]
        );

        return NextResponse.json({
            message: 'Reward updated',
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: Params
) {
    try {
        const { kode } = await params;

        const result = await pool.query(
            `DELETE FROM HADIAH 
             WHERE kode_hadiah = $1 AND program_end < CURRENT_DATE 
             RETURNING *`,
            [kode]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Hadiah tidak dapat dihapus karena masih aktif atau tidak ditemukan.' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Reward deleted',
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}