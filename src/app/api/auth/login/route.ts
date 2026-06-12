import pool from '@/lib/db';
import { signToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const authCheck = await pool.query(
      'SELECT * FROM verifikasi_login($1, $2)', [email, password]
    );
    
    const role = authCheck.rows[0].role; // 'Member' atau 'Staf'

    const penggunaQuery = await pool.query('SELECT * FROM PENGGUNA WHERE email = $1', [email]);
    const userData = penggunaQuery.rows[0];

    let extraData = {};

    if (role === 'Member') {
      const memberQuery = await pool.query('SELECT * FROM MEMBER WHERE email = $1', [email]);
      extraData = { memberData: memberQuery.rows[0] };
    } else if (role === 'Staf') {
      const staffQuery = await pool.query('SELECT * FROM STAF WHERE email = $1', [email]);
      extraData = { staffData: staffQuery.rows[0] };
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

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' }, 
      { status: 401 } 
    );
  }
}