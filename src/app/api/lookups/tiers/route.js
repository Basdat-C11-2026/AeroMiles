import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM TIER ORDER BY minimal_tier_miles ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}