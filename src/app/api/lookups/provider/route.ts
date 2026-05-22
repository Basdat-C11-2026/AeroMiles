import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT 
                id_penyedia,
                nama_maskapai AS nama
            FROM MASKAPAI

            UNION

            SELECT
                id_penyedia,
                nama_mitra AS nama
            FROM MITRA
        `);

        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}