import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ emails: string }> }) {
  try {
    const { emails } = await params;
    const decodedEmail = decodeURIComponent(emails); 
    const result = await pool.query(
      `SELECT p.*, m.nomor_member, t.nama as id_tier, m.tanggal_bergabung, m.award_miles, m.total_miles
       FROM PENGGUNA p 
       JOIN MEMBER m ON p.email = m.email 
       JOIN TIER t ON m.id_tier = t.id_tier
       WHERE p.email = $1`,
      [decodedEmail]
    );

    const row = result.rows[0];
    if (!row) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const safeRow = {
      email: row.email,
      nomor_member: row.nomor_member,
      salutation: row.salutation,
      first_mid_name: row.first_mid_name,
      last_name: row.last_name,
      country_code: row.country_code,
      mobile_number: row.mobile_number,
      tanggal_lahir: row.tanggal_lahir ? (new Date(row.tanggal_lahir)).toISOString().split('T')[0] : null,
      kewarganegaraan: row.kewarganegaraan,
      id_tier: row.id_tier,
      tanggal_bergabung: row.tanggal_bergabung ? (new Date(row.tanggal_bergabung)).toISOString().split('T')[0] : null,
      award_miles: row.award_miles !== undefined && row.award_miles !== null ? Number(row.award_miles) : 0,
      total_miles: row.total_miles !== undefined && row.total_miles !== null ? Number(row.total_miles) : 0,
    };

    return NextResponse.json(safeRow);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ emails: string }> }) {
  const client = await pool.connect();
  try {
    const { emails } = await params;
    const data = await req.json();
    
    await client.query('BEGIN');

    await client.query(
      `UPDATE PENGGUNA SET salutation = $1, first_mid_name = $2, last_name = $3, 
       country_code = $4, mobile_number = $5, tanggal_lahir = $6, kewarganegaraan = $7
       WHERE email = $8`,
      [data.salutation, data.first_mid_name, data.last_name, data.country_code, data.mobile_number, data.tanggal_lahir, data.kewarganegaraan, emails]
    );

    if (data.id_tier) {
      const tierRes = await client.query('SELECT id_tier FROM TIER WHERE nama = $1', [data.id_tier]);
      if (tierRes.rows.length > 0) {
        await client.query('UPDATE MEMBER SET id_tier = $1 WHERE email = $2', [tierRes.rows[0].id_tier, emails]);
      }
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ emails: string }> }) {
  const client = await pool.connect();
  try {
    const { emails } = await params;
    await client.query('BEGIN');
    
    await client.query('DELETE FROM MEMBER WHERE email = $1', [emails]);
    await client.query('DELETE FROM PENGGUNA WHERE email = $1', [emails]);
    
    await client.query('COMMIT');
    return NextResponse.json({ message: 'Member berhasil dihapus' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}