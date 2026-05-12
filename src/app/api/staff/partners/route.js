import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query('SELECT email_mitra, id_penyedia, nama_mitra, tanggal_kerja_sama FROM MITRA');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const client = await pool.connect();
  try {
    const { email_mitra, nama_mitra, tanggal_kerja_sama } = await req.json();
    await client.query('BEGIN');

    const penyediaRes = await client.query('INSERT INTO PENYEDIA DEFAULT VALUES RETURNING id');
    const id_penyedia = penyediaRes.rows[0].id;

    await client.query(
      `INSERT INTO MITRA (email_mitra, id_penyedia, nama_mitra, tanggal_kerja_sama) 
       VALUES ($1, $2, $3, $4)`,
      [email_mitra, id_penyedia, nama_mitra, tanggal_kerja_sama]
    );

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Mitra berhasil didaftarkan' }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}