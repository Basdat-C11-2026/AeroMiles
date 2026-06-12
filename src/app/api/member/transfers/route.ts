import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email dibutuhkan' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT 
        t.*,
        p1.first_mid_name || ' ' || p1.last_name as nama_pengirim,
        p2.first_mid_name || ' ' || p2.last_name as nama_penerima
       FROM TRANSFER t
       JOIN pengguna p1 ON t.email_member_1 = p1.email
       JOIN pengguna p2 ON t.email_member_2 = p2.email
       WHERE t.email_member_1 = $1 OR t.email_member_2 = $1 
       ORDER BY t.timestamp DESC`,
      [email]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email_pengirim, email_penerima, jumlah, catatan } = await req.json();

    if (!email_pengirim || !email_penerima || !jumlah || jumlah <= 0) {
      return NextResponse.json({ error: 'Data transfer tidak valid' }, { status: 400 });
    }

    if (email_pengirim === email_penerima) {
      return NextResponse.json({ error: 'Tidak dapat transfer ke diri sendiri' }, { status: 400 });
    }

    const receiverCheck = await pool.query('SELECT email FROM member WHERE email = $1', [email_penerima]);
    if (receiverCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Email penerima tidak terdaftar sebagai Member AeroMiles.' }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO TRANSFER (email_member_1, email_member_2, jumlah, catatan, timestamp) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`,
      [email_pengirim, email_penerima, jumlah, catatan || '-']
    );

    return NextResponse.json({ 
        success: true, 
        message: `Transfer ${jumlah} miles ke ${email_penerima} berhasil.`,
        data: res.rows[0] 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}