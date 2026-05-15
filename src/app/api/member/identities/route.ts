import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const result = await pool.query(
      'SELECT * FROM IDENTITAS WHERE email_member = $1',
      [email]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nomor, email_member, tanggal_habis, tanggal_terbit, negara_penerbit, jenis } = await req.json();
    const result = await pool.query(
      `INSERT INTO IDENTITAS (nomor, email_member, tanggal_habis, tanggal_terbit, negara_penerbit, jenis)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nomor, email_member, tanggal_habis, tanggal_terbit, negara_penerbit, jenis]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}