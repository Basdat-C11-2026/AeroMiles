import pool from '@/lib/db';
import { signToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const userQuery = await pool.query(
      'SELECT * FROM PENGGUNA WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (userQuery.rows.length === 0) {
      return NextResponse.json({ error: 'Email atau password salah, silakan coba lagi.' }, { status: 401 });
    }

    const userData = userQuery.rows[0];
    let role: 'Member' | 'Staf' | null = null;
    let extraData = {};

    // Cek Role Member
    const memberQuery = await pool.query('SELECT * FROM MEMBER WHERE email = $1', [email]);
    if (memberQuery.rows.length > 0) {
      role = 'Member';
      extraData = { memberData: memberQuery.rows[0] };
    } else {
      // Cek Role Staf
      const staffQuery = await pool.query('SELECT * FROM STAF WHERE email = $1', [email]);
      if (staffQuery.rows.length > 0) {
        role = 'Staf';
        extraData = { staffData: staffQuery.rows[0] };
      }
    }

    if (!role) {
      return NextResponse.json({ error: 'Role tidak ditemukan.' }, { status: 403 });
    }

    const response = NextResponse.json({
      message: 'Login berhasil',
      role: role,
      user: userData,
      ...extraData
    }, { status: 200 });

    const token = await signToken({ 
      email: userData.email, 
      role: role 
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, 
    });

    return response;

  } catch (error) {
    let errorMessage = 'Terjadi kesalahan server';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}