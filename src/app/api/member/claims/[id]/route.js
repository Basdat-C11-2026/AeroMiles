import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();

    const checkStatus = await pool.query('SELECT status_penerimaan FROM CLAIM_MISSING_MILES WHERE id = $1', [id]);
    if (checkStatus.rows[0].status_penerimaan !== 'Menunggu') {
      return NextResponse.json({ error: 'Hanya klaim berstatus Menunggu yang dapat diubah' }, { status: 400 });
    }

    await pool.query(
      `UPDATE CLAIM_MISSING_MILES 
       SET maskapai = $1, bandara_asal = $2, bandara_tujuan = $3, tanggal_penerbangan = $4, 
           flight_number = $5, nomor_tiket = $6, kelas_kabin = $7, pnr = $8
       WHERE id = $9`,
      [
        data.maskapai, data.bandara_asal, data.bandara_tujuan, data.tanggal_penerbangan, 
        data.flight_number, data.nomor_tiket, data.kelas_kabin, data.pnr, id
      ]
    );

    return NextResponse.json({ message: 'Klaim berhasil diperbarui' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const checkStatus = await pool.query('SELECT status_penerimaan FROM CLAIM_MISSING_MILES WHERE id = $1', [id]);
    if (checkStatus.rows[0].status_penerimaan !== 'Menunggu') {
      return NextResponse.json({ error: 'Hanya klaim berstatus Menunggu yang dapat dibatalkan' }, { status: 400 });
    }

    await pool.query('DELETE FROM CLAIM_MISSING_MILES WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Klaim berhasil dibatalkan' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}