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

    if (status === 'Disetujui') {
      const claimRes = await client.query('SELECT email_member FROM CLAIM_MISSING_MILES WHERE id = $1', [id]);
      
      if (claimRes.rows.length > 0) {
        const email_member = claimRes.rows[0].email_member;

        const milesDiberikan = 1000; 

        await client.query(
          `UPDATE MEMBER 
           SET total_miles = total_miles + $1, 
               award_miles = award_miles + $1 
           WHERE email = $2`,
          [milesDiberikan, email_member]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Status klaim berhasil diperbarui dan miles disesuaikan' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}