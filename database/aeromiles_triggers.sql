SET search_path TO aeromiles;

-- =========================================================
-- AeroMiles trigger and stored-function bundle
-- Seluruh logika miles dipusatkan di database agar konsisten
-- dengan deskripsi tugas dan tidak dobel dihitung di API.
-- =========================================================

-- 1. Pemeriksaan Duplikasi Email saat Registrasi
CREATE OR REPLACE FUNCTION cek_duplikasi_email()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM PENGGUNA
        WHERE LOWER(email) = LOWER(NEW.email)
    ) THEN
        RAISE EXCEPTION 'ERROR: Email "%" sudah terdaftar, silakan gunakan email lain.', NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cek_duplikasi_email ON PENGGUNA;
CREATE TRIGGER trg_cek_duplikasi_email
BEFORE INSERT ON PENGGUNA
FOR EACH ROW
EXECUTE FUNCTION cek_duplikasi_email();


-- 2. Verifikasi Kredensial saat Login
CREATE OR REPLACE FUNCTION verifikasi_login(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE(email VARCHAR, role VARCHAR) AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM PENGGUNA
        WHERE PENGGUNA.email = p_email
          AND PENGGUNA.password = p_password
    ) THEN
        RAISE EXCEPTION 'Email atau password salah, silakan coba lagi.';
    END IF;

    RETURN QUERY
    SELECT p.email,
           CASE WHEN s.email IS NOT NULL THEN 'Staf' ELSE 'Member' END::VARCHAR
    FROM PENGGUNA p
    LEFT JOIN STAF s ON p.email = s.email
    WHERE p.email = p_email;
END;
$$ LANGUAGE plpgsql;


-- 3. Pencegahan Transfer Miles Melebihi Saldo + Update saldo penerima
CREATE OR REPLACE FUNCTION proses_transfer_miles()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo_pengirim INT;
BEGIN
    IF NEW.jumlah IS NULL OR NEW.jumlah <= 0 THEN
        RAISE EXCEPTION 'ERROR: Jumlah transfer miles harus lebih dari 0.';
    END IF;

    IF NEW.email_member_1 = NEW.email_member_2 THEN
        RAISE EXCEPTION 'ERROR: Member tidak dapat mentransfer miles ke dirinya sendiri.';
    END IF;

    SELECT award_miles
    INTO v_saldo_pengirim
    FROM MEMBER
    WHERE email = NEW.email_member_1
    FOR UPDATE;

    IF v_saldo_pengirim IS NULL THEN
        RAISE EXCEPTION 'ERROR: Member pengirim "%" tidak ditemukan.', NEW.email_member_1;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM MEMBER
        WHERE email = NEW.email_member_2
    ) THEN
        RAISE EXCEPTION 'ERROR: Member penerima "%" tidak ditemukan.', NEW.email_member_2;
    END IF;

    IF v_saldo_pengirim < NEW.jumlah THEN
        RAISE EXCEPTION 'ERROR: Saldo award miles tidak mencukupi. Saldo Anda saat ini: % miles, jumlah transfer: % miles.', v_saldo_pengirim, NEW.jumlah;
    END IF;

    UPDATE MEMBER
    SET award_miles = award_miles - NEW.jumlah
    WHERE email = NEW.email_member_1;

    UPDATE MEMBER
    SET award_miles = award_miles + NEW.jumlah,
        total_miles = total_miles + NEW.jumlah
    WHERE email = NEW.email_member_2;

    RAISE NOTICE 'SUKSES: Transfer % miles dari "%" ke "%" berhasil dicatat.', NEW.jumlah, NEW.email_member_1, NEW.email_member_2;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proses_transfer_miles ON TRANSFER;
CREATE TRIGGER trg_proses_transfer_miles
BEFORE INSERT ON TRANSFER
FOR EACH ROW
EXECUTE FUNCTION proses_transfer_miles();


-- 4. Validasi dan Update Saldo Award Miles saat Redeem Hadiah
CREATE OR REPLACE FUNCTION proses_redeem_hadiah()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo INT;
    v_harga_miles INT;
    v_nama_hadiah VARCHAR;
    v_start DATE;
    v_end DATE;
BEGIN
    SELECT award_miles
    INTO v_saldo
    FROM MEMBER
    WHERE email = NEW.email_member
    FOR UPDATE;

    IF v_saldo IS NULL THEN
        RAISE EXCEPTION 'ERROR: Member "%" tidak ditemukan.', NEW.email_member;
    END IF;

    SELECT nama, miles, valid_start_date, program_end
    INTO v_nama_hadiah, v_harga_miles, v_start, v_end
    FROM HADIAH
    WHERE kode_hadiah = NEW.kode_hadiah;

    IF v_nama_hadiah IS NULL THEN
        RAISE EXCEPTION 'ERROR: Hadiah dengan kode "%" tidak ditemukan.', NEW.kode_hadiah;
    END IF;

    IF CURRENT_DATE < v_start OR CURRENT_DATE > v_end THEN
        RAISE EXCEPTION 'ERROR: Hadiah "%" tidak tersedia pada periode ini.', v_nama_hadiah;
    END IF;

    IF v_harga_miles IS NULL OR v_harga_miles <= 0 THEN
        RAISE EXCEPTION 'ERROR: Data miles untuk hadiah "%" tidak valid.', v_nama_hadiah;
    END IF;

    IF v_saldo < v_harga_miles THEN
        RAISE EXCEPTION 'ERROR: Saldo award miles tidak mencukupi. Dibutuhkan % miles, saldo Anda: % miles.', v_harga_miles, v_saldo;
    END IF;

    UPDATE MEMBER
    SET award_miles = award_miles - v_harga_miles
    WHERE email = NEW.email_member;

    RAISE NOTICE 'SUKSES: Redeem hadiah "%" berhasil. Award miles Anda berkurang % miles.', v_nama_hadiah, v_harga_miles;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proses_redeem_hadiah ON REDEEM;
CREATE TRIGGER trg_proses_redeem_hadiah
BEFORE INSERT ON REDEEM
FOR EACH ROW
EXECUTE FUNCTION proses_redeem_hadiah();


-- 4.2 Sinkronisasi Award Miles setelah Transaksi Pembelian Package
CREATE OR REPLACE FUNCTION proses_beli_package()
RETURNS TRIGGER AS $$
DECLARE
    v_jumlah_miles INT;
BEGIN
    SELECT jumlah_award_miles
    INTO v_jumlah_miles
    FROM AWARD_MILES_PACKAGE
    WHERE id = NEW.id_award_miles_package;

    IF v_jumlah_miles IS NULL THEN
        RAISE EXCEPTION 'ERROR: Package award miles "%" tidak ditemukan.', NEW.id_award_miles_package;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM MEMBER
        WHERE email = NEW.email_member
    ) THEN
        RAISE EXCEPTION 'ERROR: Member "%" tidak ditemukan.', NEW.email_member;
    END IF;

    UPDATE MEMBER
    SET award_miles = award_miles + v_jumlah_miles,
        total_miles = total_miles + v_jumlah_miles
    WHERE email = NEW.email_member;

    RAISE NOTICE 'SUKSES: Pembelian package berhasil. Award miles dan total miles Anda bertambah % miles.', v_jumlah_miles;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proses_beli_package ON MEMBER_AWARD_MILES_PACKAGE;
CREATE TRIGGER trg_proses_beli_package
AFTER INSERT ON MEMBER_AWARD_MILES_PACKAGE
FOR EACH ROW
EXECUTE FUNCTION proses_beli_package();


-- 5. Pemeriksaan Status Klaim Missing Miles yang Duplikat
CREATE OR REPLACE FUNCTION cek_duplikasi_klaim()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM CLAIM_MISSING_MILES
        WHERE flight_number = NEW.flight_number
          AND tanggal_penerbangan = NEW.tanggal_penerbangan
          AND nomor_tiket = NEW.nomor_tiket
          AND email_member = NEW.email_member
    ) THEN
        RAISE EXCEPTION 'ERROR: Klaim untuk penerbangan "%" pada tanggal "%" dengan nomor tiket "%" sudah pernah diajukan sebelumnya.', NEW.flight_number, NEW.tanggal_penerbangan, NEW.nomor_tiket;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cek_duplikasi_klaim ON CLAIM_MISSING_MILES;
CREATE TRIGGER trg_cek_duplikasi_klaim
BEFORE INSERT ON CLAIM_MISSING_MILES
FOR EACH ROW
EXECUTE FUNCTION cek_duplikasi_klaim();


-- 5.2 Pembaruan Tier Member secara Otomatis berdasarkan Total Miles
CREATE OR REPLACE FUNCTION update_tier_otomatis()
RETURNS TRIGGER AS $$
DECLARE
    v_tier_baru VARCHAR;
    v_nama_tier VARCHAR;
BEGIN
    IF NEW.total_miles IS DISTINCT FROM OLD.total_miles THEN
        SELECT id_tier, nama
        INTO v_tier_baru, v_nama_tier
        FROM TIER
        WHERE minimal_tier_miles <= NEW.total_miles
        ORDER BY minimal_tier_miles DESC
        LIMIT 1;

        IF v_tier_baru IS NOT NULL AND v_tier_baru <> OLD.id_tier THEN
            NEW.id_tier := v_tier_baru;
            RAISE NOTICE 'SUKSES: Tier Member "%" telah diperbarui dari "%" menjadi "%" berdasarkan total miles yang dimiliki.', NEW.email, OLD.id_tier, v_nama_tier;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_tier_otomatis ON MEMBER;
CREATE TRIGGER trg_update_tier_otomatis
BEFORE UPDATE ON MEMBER
FOR EACH ROW
EXECUTE FUNCTION update_tier_otomatis();


-- 5.3 Sinkronisasi Total Miles Member setelah Klaim Missing Miles Disetujui
CREATE OR REPLACE FUNCTION proses_klaim_disetujui()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status_penerimaan IS DISTINCT FROM NEW.status_penerimaan
       AND NEW.status_penerimaan = 'Disetujui' THEN
        UPDATE MEMBER
        SET award_miles = award_miles + 1000,
            total_miles = total_miles + 1000
        WHERE email = NEW.email_member;

        RAISE NOTICE 'SUKSES: Total miles Member "%" telah diperbarui. Miles ditambahkan: 1000 miles dari klaim penerbangan "%".', NEW.email_member, NEW.flight_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proses_klaim_disetujui ON CLAIM_MISSING_MILES;
CREATE TRIGGER trg_proses_klaim_disetujui
AFTER UPDATE ON CLAIM_MISSING_MILES
FOR EACH ROW
EXECUTE FUNCTION proses_klaim_disetujui();


-- 5.4 Pemeringkatan Top 5 Member berdasarkan Total Miles
CREATE OR REPLACE FUNCTION get_top_5_members()
RETURNS TABLE (
    email VARCHAR,
    name VARCHAR,
    tier VARCHAR,
    total_miles INT
) AS $$
DECLARE
    v_email_top1 VARCHAR;
    v_miles_top1 INT;
BEGIN
    SELECT m.email, m.total_miles
    INTO v_email_top1, v_miles_top1
    FROM MEMBER m
    ORDER BY m.total_miles DESC, m.email ASC
    LIMIT 1;

    IF v_email_top1 IS NOT NULL THEN
        RAISE NOTICE 'SUKSES: Daftar Top 5 Member berdasarkan total miles berhasil diperbarui, dengan peringkat pertama "%" memiliki % miles.', v_email_top1, v_miles_top1;
    END IF;

    RETURN QUERY
    SELECT
        m.email,
        p.first_mid_name || ' ' || p.last_name AS name,
        COALESCE(t.nama, m.id_tier)::VARCHAR AS tier,
        m.total_miles
    FROM MEMBER m
    JOIN PENGGUNA p ON p.email = m.email
    LEFT JOIN TIER t ON t.id_tier = m.id_tier
    ORDER BY m.total_miles DESC, m.email ASC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;