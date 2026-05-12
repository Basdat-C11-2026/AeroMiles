import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email'); 

    if (!email) {
      return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 });
    }

    const userQuery = await pool.query('SELECT * FROM PENGGUNA WHERE email = $1', [email]);
    
    if (userQuery.rows.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const user = userQuery.rows[0];

    // Cek apakah pengguna adalah Member
    const memberQuery = await pool.query('SELECT * FROM MEMBER WHERE email = $1', [email]);
    if (memberQuery.rows.length > 0) {
      return NextResponse.json({ role: 'Member', ...user, ...memberQuery.rows[0] });
    }

    // Cek apakah pengguna adalah Staf
    const staffQuery = await pool.query('SELECT * FROM STAF WHERE email = $1', [email]);
    if (staffQuery.rows.length > 0) {
      return NextResponse.json({ role: 'Staf', ...user, ...staffQuery.rows[0] });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const client = await pool.connect();
  try {
    const data = await req.json();
    const { 
      email, salutation, first_mid_name, last_name, 
      country_code, mobile_number, tanggal_lahir, 
      kewarganegaraan, kode_maskapai 
    } = data;

    await client.query('BEGIN');

    await client.query(
      `UPDATE PENGGUNA 
       SET salutation = $1, first_mid_name = $2, last_name = $3, 
           country_code = $4, mobile_number = $5, tanggal_lahir = $6, kewarganegaraan = $7
       WHERE email = $8`,
      [salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan, email]
    );

    if (kode_maskapai) {
      await client.query(
        'UPDATE STAF SET kode_maskapai = $1 WHERE email = $2', 
        [kode_maskapai, email]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Profil berhasil diperbarui' });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}