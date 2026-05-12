import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { status, email_staf } = await req.json();

    await pool.query(
      `UPDATE CLAIM_MISSING_MILES 
       SET status_penerimaan = $1, email_staf = $2 
       WHERE id = $3`,
      [status, email_staf, id]
    );

    return NextResponse.json({ message: 'Status klaim berhasil diperbarui' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}