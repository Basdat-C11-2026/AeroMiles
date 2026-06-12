import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await pool.connect();
  try {
    const { id } = await params; 
    const { status, email_staf } = await req.json();

    await client.query('BEGIN');

    await client.query(
      `UPDATE CLAIM_MISSING_MILES 
       SET status_penerimaan = $1, email_staf = $2 
       WHERE id = $3`,
      [status, email_staf, id]
    );

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Status klaim berhasil diperbarui dan miles disesuaikan' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}