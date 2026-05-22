import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { email_member, kode_hadiah } = await req.json();

    await client.query('BEGIN');

    const res = await client.query(
      'INSERT INTO REDEEM (email_member, kode_hadiah, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
      [email_member, kode_hadiah]
    );

    await client.query('COMMIT');
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    client.release();
  }
}