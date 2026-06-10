import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ nomor: string }> }) {
  try {
    const { nomor } = await params;
    const { tanggal_habis, tanggal_terbit, negara_penerbit, jenis } = await req.json();

    await pool.query(
      `UPDATE IDENTITAS 
       SET tanggal_habis = $1, tanggal_terbit = $2, negara_penerbit = $3, jenis = $4
       WHERE nomor = $5`,
      [tanggal_habis, tanggal_terbit, negara_penerbit, jenis, nomor]
    );

    return NextResponse.json({ message: 'Identitas berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ nomor: string }> }) {
  try {
    const { nomor } = await params;

    await pool.query('DELETE FROM IDENTITAS WHERE nomor = $1', [nomor]);

    return NextResponse.json({ message: 'Identitas berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}