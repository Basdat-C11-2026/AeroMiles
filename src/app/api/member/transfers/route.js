import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const result = await pool.query(
      `SELECT * FROM TRANSFER 
       WHERE email_member_1 = $1 OR email_member_2 = $1 
       ORDER BY timestamp DESC`,
      [email]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const client = await pool.connect();
  try {
    const { email_pengirim, email_penerima, jumlah, catatan } = await req.json();

    await client.query('BEGIN');

    const res = await client.query(
      'INSERT INTO TRANSFER (email_member_1, email_member_2, jumlah, catatan, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
      [email_pengirim, email_penerima, jumlah, catatan]
    );

    await client.query('COMMIT');
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    client.release();
  }
}