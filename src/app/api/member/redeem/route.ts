import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const email = searchParams.get('email');

    if (type === 'catalog') {
      const catalogResult = await pool.query(
        `SELECT 
      h.kode_hadiah as id, 
      h.nama as name, 
      COALESCE(m.nama_maskapai, mt.nama_mitra, 'AeroMiles Reward') as provider, 
      h.miles as "requiredMiles", 
      h.deskripsi as description, 
      h.valid_start_date as "validStart", 
      h.program_end as "validEnd"
     FROM hadiah h
     LEFT JOIN maskapai m ON h.id_penyedia = m.id_penyedia
     LEFT JOIN mitra mt ON h.id_penyedia = mt.id_penyedia
     WHERE h.program_end >= CURRENT_DATE
     ORDER BY h.miles ASC`
      );
      return NextResponse.json(catalogResult.rows);
    }

    if (type === 'history') {
      if (!email) return NextResponse.json({ error: 'Email wajib disertakan' }, { status: 400 });

      const historyResult = await pool.query(
        `SELECT 
          r.kode_hadiah,
          h.nama as reward_name,
          r.timestamp,
          h.miles as miles_used
         FROM redeem r
         JOIN hadiah h ON r.kode_hadiah = h.kode_hadiah
         WHERE r.email_member = $1
         ORDER BY r.timestamp DESC`,
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
  const client = await pool.connect();
  try {
    const { email_member, kode_hadiah } = await req.json();

    await client.query('BEGIN');

    const rewardRes = await client.query('SELECT miles FROM hadiah WHERE kode_hadiah = $1 AND program_end >= CURRENT_DATE', [kode_hadiah]);
    if (rewardRes.rows.length === 0) {
      throw new Error('Hadiah tidak ditemukan atau sudah kadaluwarsa.');
    }
    const requiredMiles = rewardRes.rows[0].miles;

    const memberRes = await client.query('SELECT award_miles FROM member WHERE email = $1', [email_member]);
    if (memberRes.rows.length === 0) {
      throw new Error('Data member tidak ditemukan.');
    }
    const currentMiles = memberRes.rows[0].award_miles;

    if (currentMiles < requiredMiles) {
      throw new Error(`Award miles tidak mencukupi. (Dibutuhkan: ${requiredMiles}, Tersedia: ${currentMiles})`);
    }

    const res = await client.query(
      'INSERT INTO REDEEM (email_member, kode_hadiah, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
      [email_member, kode_hadiah]
    );

    await client.query('COMMIT');
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    client.release();
  }
}