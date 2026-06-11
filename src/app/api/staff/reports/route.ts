import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const queryTrx = `
            SELECT 
                'Transfer' as tipe, 
                t.email_member_1 as member_email, 
                p.first_mid_name || ' ' || p.last_name as member_name,
                t.jumlah as miles, 
                t.timestamp 
            FROM TRANSFER t JOIN PENGGUNA p ON t.email_member_1 = p.email
            UNION ALL
            SELECT 
                'Redeem' as tipe, 
                r.email_member as member_email, 
                p.first_mid_name || ' ' || p.last_name as member_name,
                h.miles, 
                r.timestamp 
            FROM REDEEM r JOIN HADIAH h ON r.kode_hadiah = h.kode_hadiah JOIN PENGGUNA p ON r.email_member = p.email
            UNION ALL
            SELECT 
                'Beli Package' as tipe, 
                mp.email_member as member_email, 
                p.first_mid_name || ' ' || p.last_name as member_name,
                ap.jumlah_award_miles as miles, 
                mp.timestamp 
            FROM MEMBER_AWARD_MILES_PACKAGE mp JOIN AWARD_MILES_PACKAGE ap ON mp.id_award_miles_package = ap.id JOIN PENGGUNA p ON mp.email_member = p.email
            UNION ALL
            SELECT 
                'Klaim Disetujui' as tipe, 
                c.email_member as member_email, 
                p.first_mid_name || ' ' || p.last_name as member_name,
                0 as miles,  -- Claim missing miles tidak memiliki kolom miles di DB
                c.timestamp 
            FROM CLAIM_MISSING_MILES c JOIN PENGGUNA p ON c.email_member = p.email 
            WHERE c.status_penerimaan = 'Disetujui'
            ORDER BY timestamp DESC
        `;
        const resTrx = await pool.query(queryTrx);

        const resStats = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(total_miles), 0) FROM MEMBER) as total_beredar,
                (SELECT COALESCE(SUM(h.miles), 0) FROM REDEEM r JOIN HADIAH h ON r.kode_hadiah = h.kode_hadiah WHERE EXTRACT(MONTH FROM r.timestamp) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM r.timestamp) = EXTRACT(YEAR FROM CURRENT_DATE)) as total_redeem_bulan_ini,
                (SELECT COUNT(*) FROM CLAIM_MISSING_MILES WHERE status_penerimaan = 'Disetujui') as total_klaim_disetujui
        `);

        const resTopMiles = await pool.query(`
            SELECT 
                p.first_mid_name || ' ' || p.last_name as name, 
                m.total_miles as "totalMiles", 
                m.id_tier as tier 
            FROM MEMBER m 
            JOIN PENGGUNA p ON m.email = p.email 
            ORDER BY m.total_miles DESC 
            LIMIT 5
        `);

        const resTopActive = await pool.query(`
            SELECT
                p.first_mid_name || ' ' || p.last_name as name,
                COALESCE(t.transfer_count, 0) + COALESCE(r.redeem_count, 0) as count,
                'Transfer (' || COALESCE(t.transfer_count, 0) || '), Redeem (' || COALESCE(r.redeem_count, 0) || ')' as activities
            FROM MEMBER m
            JOIN PENGGUNA p ON m.email = p.email
            LEFT JOIN (SELECT email_member_1, COUNT(*) as transfer_count FROM TRANSFER GROUP BY email_member_1) t ON m.email = t.email_member_1
            LEFT JOIN (SELECT email_member, COUNT(*) as redeem_count FROM REDEEM GROUP BY email_member) r ON m.email = r.email_member
            ORDER BY count DESC
            LIMIT 5
        `);

        return NextResponse.json({
            transactions: resTrx.rows,
            stats: resStats.rows[0],
            topMiles: resTopMiles.rows,
            topActive: resTopActive.rows
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { tipe, member, timestamp } = await req.json();

        const formattedTimestamp = new Date(timestamp).toISOString();

        if (tipe === 'Transfer') {
            await pool.query('DELETE FROM TRANSFER WHERE email_member_1 = $1 AND timestamp = $2', [member, formattedTimestamp]);
        } else if (tipe === 'Redeem') {
            await pool.query('DELETE FROM REDEEM WHERE email_member = $1 AND timestamp = $2', [member, formattedTimestamp]);
        } else {
            return NextResponse.json({ error: 'Tipe transaksi tidak dapat dihapus atau tidak valid' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Riwayat transaksi berhasil dihapus' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}