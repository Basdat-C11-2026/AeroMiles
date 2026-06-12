import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); 
    const email = searchParams.get('email');

    if (type === 'catalog') {
      const catalogResult = await pool.query(
        'SELECT id, harga_paket, jumlah_award_miles FROM AWARD_MILES_PACKAGE ORDER BY jumlah_award_miles ASC'
      );
      return NextResponse.json(catalogResult.rows);
    }

    if (type === 'history') {
      if (!email) {
        return NextResponse.json({ error: 'Email member wajib disertakan' }, { status: 400 });
      }
      
      const historyResult = await pool.query(
        `SELECT 
          mamp.id_award_miles_package as package_id,
          amp.jumlah_award_miles as miles_added,
          amp.harga_paket as price_paid,
          mamp.timestamp
         FROM MEMBER_AWARD_MILES_PACKAGE mamp
         JOIN AWARD_MILES_PACKAGE amp ON mamp.id_award_miles_package = amp.id
         WHERE mamp.email_member = $1
         ORDER BY mamp.timestamp DESC`,
        [email]
      );
      return NextResponse.json(historyResult.rows);
    }

    return NextResponse.json({ error: 'Tipe permintaan tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, id_paket } = await req.json();

    if (!email || !id_paket) {
      return NextResponse.json({ error: 'Email dan ID Paket wajib diisi.' }, { status: 400 });
    }

    await pool.query('BEGIN');

    const pkgResult = await pool.query(
      'SELECT 1 FROM AWARD_MILES_PACKAGE WHERE id = $1',
      [id_paket]
    );

    if (pkgResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return NextResponse.json({ error: 'Paket tidak ditemukan.' }, { status: 404 });
    }

    await pool.query(
      'INSERT INTO MEMBER_AWARD_MILES_PACKAGE (id_award_miles_package, email_member, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP)',
      [id_paket, email]
    );

    await pool.query('COMMIT');

    return NextResponse.json({ message: 'Pembelian paket berhasil' }, { status: 201 });
  } catch (error: any) {
    await pool.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}