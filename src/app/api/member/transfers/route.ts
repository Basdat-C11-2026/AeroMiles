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
      `SELECT * FROM TRANSFER 
       WHERE email_member_1 = $1 OR email_member_2 = $1 
       ORDER BY timestamp DESC`,
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

    // Validasi input dasar dari frontend
    if (!email_pengirim || !email_penerima || !jumlah) {
      return NextResponse.json(
        { error: 'Data transfer tidak lengkap' },
        { status: 400 }
      );
    }

    const res = await pool.query(
      `INSERT INTO TRANSFER (email_member_1, email_member_2, jumlah, catatan, timestamp) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`,
      [email_pengirim, email_penerima, jumlah, catatan]
    );

    return NextResponse.json({ 
        success: true, 
        message: `Transfer ${jumlah} miles ke ${email_penerima} berhasil.`,
        data: res.rows[0] 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 400 }
    );
  }
}