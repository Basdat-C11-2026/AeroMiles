import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const email = searchParams.get('email');
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');

    let query = `
      SELECT 'Transfer' as tipe, email_member_1 as member, jumlah as miles, timestamp FROM TRANSFER
      UNION ALL
      SELECT 'Redeem' as tipe, r.email_member, h.miles, r.timestamp FROM REDEEM r JOIN HADIAH h ON r.kode_hadiah = h.kode_hadiah
      UNION ALL
      SELECT 'Package' as tipe, mp.email_member, ap.jumlah_award_miles, mp.timestamp FROM MEMBER_AWARD_MILES_PACKAGE mp JOIN AWARD_MILES_PACKAGE ap ON mp.id_award_miles_package = ap.id
      UNION ALL
      SELECT 'Klaim' as tipe, email_member, 1000, timestamp FROM CLAIM_MISSING_MILES WHERE status_penerimaan = 'Disetujui'
    `;

    const conditions = [];
    const params = [];

    if (type) {
      params.push(type);
      conditions.push(`tipe = $${params.length}`);
    }
    if (email) {
      params.push(email);
      conditions.push(`member = $${params.length}`);
    }
    if (start && end) {
      params.push(start, end);
      conditions.push(`timestamp::date BETWEEN $${params.length - 1} AND $${params.length}`);
    }

    if (conditions.length > 0) {
      query = `SELECT * FROM (${query}) AS combined WHERE ${conditions.join(' AND ')} ORDER BY timestamp DESC`;
    } else {
      query = `SELECT * FROM (${query}) AS combined ORDER BY timestamp DESC`;
    }

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { tipe, member, timestamp } = await req.json();

    if (tipe === 'Transfer') {
      await pool.query('DELETE FROM TRANSFER WHERE email_member_1 = $1 AND timestamp = $2', [member, timestamp]);
    } else if (tipe === 'Redeem') {
      await pool.query('DELETE FROM REDEEM WHERE email_member = $1 AND timestamp = $2', [member, timestamp]);
    } else {
      return NextResponse.json({ error: 'Tipe transaksi tidak dapat dihapus atau tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Riwayat transaksi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}