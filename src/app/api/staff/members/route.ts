import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');
    
    let query = `
      SELECT m.nomor_member, p.salutation, p.first_mid_name, p.last_name, 
             m.email, t.nama as tier, m.total_miles, m.award_miles, m.tanggal_bergabung 
      FROM MEMBER m
      JOIN PENGGUNA p ON m.email = p.email
      JOIN TIER t ON m.id_tier = t.id_tier
    `;
    const params = [];
    
    if (tier) {
      query += ` WHERE t.nama = $1`;
      params.push(tier);
    }
    
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const data = await req.json();
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO PENGGUNA (email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [data.email, data.password, data.salutation, data.first_mid_name, data.last_name, data.country_code, data.mobile_number, data.tanggal_lahir, data.kewarganegaraan]
    );

    const tierQuery = await client.query('SELECT id_tier FROM TIER ORDER BY minimal_tier_miles ASC LIMIT 1');
    const id_tier = tierQuery.rows[0].id_tier;
    const tanggal_bergabung = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO MEMBER (email, tanggal_bergabung, id_tier) VALUES ($1, $2, $3)`,
      [data.email, tanggal_bergabung, id_tier]
    );

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Member berhasil ditambahkan' }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}