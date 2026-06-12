import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const {
      email, password, salutation, first_mid_name, last_name,
      country_code, mobile_number, tanggal_lahir, kewarganegaraan
    } = await req.json();

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO PENGGUNA (email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan]
    );

    const tierQuery = await client.query('SELECT id_tier FROM TIER ORDER BY minimal_tier_miles ASC LIMIT 1');
    const id_tier = tierQuery.rows[0].id_tier;

    const tanggal_bergabung = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO MEMBER (email, tanggal_bergabung, id_tier)
       VALUES ($1, $2, $3)`,
      [email, tanggal_bergabung, id_tier]
    );

    await client.query('COMMIT');

    return NextResponse.json({ message: 'Registrasi Member berhasil.' }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    client.release();
  }
}