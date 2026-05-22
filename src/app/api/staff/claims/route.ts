import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT c.id, p.first_mid_name, p.last_name, c.email_member, c.maskapai, 
             c.bandara_asal, c.bandara_tujuan, c.tanggal_penerbangan, c.flight_number, 
             c.kelas_kabin, c.timestamp, c.status_penerimaan 
      FROM CLAIM_MISSING_MILES c
      JOIN PENGGUNA p ON c.email_member = p.email
      ORDER BY c.timestamp DESC
    `;
    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}