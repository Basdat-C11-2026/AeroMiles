import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT kode_hadiah, nama, miles, deskripsi, valid_start_date, program_end, id_penyedia 
      FROM HADIAH
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nama, miles, deskripsi, valid_start_date, program_end, id_penyedia } = await req.json();

    await pool.query(
      `INSERT INTO HADIAH (nama, miles, deskripsi, valid_start_date, program_end, id_penyedia) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nama, miles, deskripsi, valid_start_date, program_end, id_penyedia]
    );

    return NextResponse.json({ message: 'Reward berhasil dibuat' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}