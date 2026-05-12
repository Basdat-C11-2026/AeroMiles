import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, id_paket } = await req.json();
    await pool.query(
      'INSERT INTO MEMBER_AWARD_MILES_PACKAGE (id_award_miles_package, email_member, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP)',
      [id_paket, email]
    );
    return NextResponse.json({ message: 'Pembelian paket berhasil' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}