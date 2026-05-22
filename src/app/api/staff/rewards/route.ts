import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        h.kode_hadiah,
        h.nama,
        h.miles,
        h.deskripsi,
        h.valid_start_date,
        h.program_end,
        h.id_penyedia,
        COALESCE(m.nama_maskapai, mp.nama_mitra) AS penyedia_nama

      FROM HADIAH h
      LEFT JOIN MASKAPAI m
        ON h.id_penyedia = m.id_penyedia
      LEFT JOIN MITRA mp
        ON h.id_penyedia = mp.id_penyedia

      ORDER BY h.kode_hadiah DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nama, miles, deskripsi, valid_start_date, program_end, id_penyedia } = await req.json();

    await pool.query(
      `INSERT INTO HADIAH (nama, miles, deskripsi, valid_start_date, program_end, id_penyedia) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nama, miles, deskripsi, valid_start_date, program_end, id_penyedia]
    );

    return NextResponse.json({ message: 'Reward berhasil dibuat' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}