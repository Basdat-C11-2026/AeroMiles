import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const client = await pool.connect();
  try {
    const {
      email, password, salutation, first_mid_name, last_name,
      country_code, mobile_number, tanggal_lahir, kewarganegaraan,
      kode_maskapai
    } = await req.json();

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO PENGGUNA (email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan]
    );

    await client.query(
      `INSERT INTO STAF (email, kode_maskapai)
       VALUES ($1, $2)`,
      [email, kode_maskapai]
    );

    await client.query('COMMIT');

    return NextResponse.json({ message: 'Registrasi Staf berhasil.' }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}