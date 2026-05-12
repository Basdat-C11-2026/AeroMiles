import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query('SELECT iata_code, nama, kota, negara FROM BANDARA ORDER BY nama ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}