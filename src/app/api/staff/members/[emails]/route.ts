import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { email: string } }) {
  try {
    const { email } = params;
    const result = await pool.query(
      `SELECT p.*, m.nomor_member, m.id_tier, m.tanggal_bergabung, m.award_miles, m.total_miles
       FROM PENGGUNA p JOIN MEMBER m ON p.email = m.email WHERE p.email = $1`,
      [email]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { email: string } }) {
  const client = await pool.connect();
  try {
    const { email } = params;
    const data = await req.json();
    await client.query('BEGIN');

    await client.query(
      `UPDATE PENGGUNA SET salutation = $1, first_mid_name = $2, last_name = $3, 
       country_code = $4, mobile_number = $5, tanggal_lahir = $6, kewarganegaraan = $7
       WHERE email = $8`,
      [data.salutation, data.first_mid_name, data.last_name, data.country_code, data.mobile_number, data.tanggal_lahir, data.kewarganegaraan, email]
    );

    if (data.id_tier) {
      await client.query('UPDATE MEMBER SET id_tier = $1 WHERE email = $2', [data.id_tier, email]);
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Data member berhasil diperbarui' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { email: string } }) {
  try {
    const { email } = params;
    await pool.query('DELETE FROM PENGGUNA WHERE email = $1', [email]);
    return NextResponse.json({ message: 'Member berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}