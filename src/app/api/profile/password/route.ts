import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const { email, password_lama, password_baru, konfirmasi_password_baru } = await req.json();

    if (password_baru !== konfirmasi_password_baru) {
      return NextResponse.json({ error: 'Konfirmasi password baru tidak cocok' }, { status: 400 });
    }

    const userQuery = await pool.query('SELECT password FROM PENGGUNA WHERE email = $1', [email]);
    
    if (userQuery.rows.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // Validasi apakah password lama sesuai
    if (userQuery.rows[0].password !== password_lama) {
      return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
    }

    // Update ke password baru
    await pool.query('UPDATE PENGGUNA SET password = $1 WHERE email = $2', [password_baru, email]);

    return NextResponse.json({ message: 'Password berhasil diubah' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}