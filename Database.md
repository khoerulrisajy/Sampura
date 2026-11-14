# Dokumentasi & Skema Database: SAMPURA

**Platform Pengaduan dan Informasi Pengangkutan Sampah**  
**Database Engine:** PostgreSQL (Supabase)  
**Acuan Dokumen:** PRD v1.4/v1.5 & Diagram ERD (8 Tabel Relasional)

---

## 1. Ikhtisar Arsitektur Database

Database **Sampura** dirancang menggunakan PostgreSQL pada layanan **Supabase** dengan mengutamakan prinsip keamanan berlapis (*Defense in Depth*) dan pemisahan hak akses (*Role-Based Access Control*):

1. **Pelaporan Publik Tanpa Akun (Zero-Login Public Access):** Masyarakat tidak disimpan di tabel `profiles`. Sebagai gantinya, setiap laporan menghasilkan pasangan **Nomor Laporan (`report_number`)** dan **Kode Akses Rahasia (`access_code`)**.
2. **Enkripsi Kode Akses Satu Arah (Bcrypt Hash):** Kode akses rahasia tidak pernah disimpan dalam bentuk teks biasa (*plain text*). Sistem hanya menyimpan hasil *hash* (`token_hash`) menggunakan ekstensi `pgcrypto` pada tabel terpisah `report_access_tokens`.
3. **Pemisahan Data Publik & Internal:** Tabel `report_status_history` memisahkan kolom `public_note` (tampil ke pelapor) dan `internal_note` (hanya tampil ke Admin RW).
4. **Perlindungan Akses Tabel dengan RLS & RPC:** Masyarakat publik tidak diberikan izin `SELECT` langsung ke tabel `reports`, `report_access_tokens`, maupun `report_status_history`. Pengiriman laporan dan pemeriksaan status oleh masyarakat wajib melewati fungsi server (`SECURITY DEFINER` PostgreSQL RPC).

---

## 2. Daftar Tabel & Relasi (ERD Mapping)

Sistem terdiri dari **8 tabel utama** yang saling berelasi:

| No | Nama Tabel | Primary Key | Foreign Key | Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `rt_areas` | `id` (UUID) | - | Menyimpan daftar wilayah RT dalam cakupan RW. |
| 2 | `categories` | `id` (UUID) | - | Menyimpan daftar kategori permasalahan sampah. |
| 3 | `profiles` | `id` (UUID) | `auth.users(id)` | Menyimpan profil dan *role* akun internal (`admin_rw`, `petugas_kebersihan`). |
| 4 | `reports` | `id` (UUID) | `rt_id`, `category_id`, `forwarded_by` | Menyimpan data utama laporan pengaduan masyarakat. |
| 5 | `report_images` | `id` (UUID) | `report_id` | Menyimpan URL bukti foto laporan (maksimal 5 foto per laporan). |
| 6 | `report_access_tokens` | `id` (UUID) | `report_id` | Menyimpan *hash* kode akses rahasia untuk pengecekan status laporan. |
| 7 | `report_status_history` | `id` (UUID) | `report_id`, `changed_by` | Menyimpan riwayat perubahan status, catatan publik, dan catatan internal. |
| 8 | `collection_schedules` | `id` (UUID) | `updated_by` | Menyimpan jadwal pengangkutan sampah yang dikelola Petugas Kebersihan. |

### Ringkasan Kardinalitas Relasi (Sesuai ERD)
* **`rt_areas` ke `reports` ($1:N$):** Satu wilayah RT dapat memiliki banyak laporan (`reports.rt_id`).
* **`categories` ke `reports` ($1:N$):** Satu kategori sampah dapat digunakan oleh banyak laporan (`reports.category_id`).
* **`profiles` ke `reports` ($1:N$):** Satu Admin RW dapat meneruskan banyak laporan ke pemerintah (`reports.forwarded_by`).
* **`profiles` ke `report_status_history` ($1:N$):** Satu Admin RW dapat memperbarui banyak riwayat status laporan (`report_status_history.changed_by`).
* **`profiles` ke `collection_schedules` ($1:N$):** Satu Petugas Kebersihan dapat mengelola banyak jadwal pengangkutan (`collection_schedules.updated_by`).
* **`reports` ke `report_images` ($1:N$):** Satu laporan dapat memiliki maksimal $5$ foto bukti (`report_images.report_id`).
* **`reports` ke `report_access_tokens` ($1:1$):** Satu laporan memiliki tepat satu *hash* kode akses rahasia (`report_access_tokens.report_id`).
* **`reports` ke `report_status_history` ($1:N$):** Satu laporan memiliki banyak catatan riwayat perubahan status (`report_status_history.report_id`).

---

## 3. Kamus Data (Data Dictionary)

### 3.1 Tabel `rt_areas`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | ID unik wilayah RT |
| `rt_number` | `TEXT` | `NOT NULL` | Nomor RT (contoh: `'RT 01'`) |
| `rw_number` | `TEXT` | `NOT NULL` | Nomor RW (contoh: `'RW 05'`) |
| `area_name` | `TEXT` | `NOT NULL` | Nama perumahan/jalan area RT |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu pembuatan data |

### 3.2 Tabel `categories`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | ID unik kategori |
| `name` | `TEXT` | `NOT NULL`, `UNIQUE` | Nama kategori permasalahan sampah |
| `description` | `TEXT` | `NULLABLE` | Penjelasan singkat kategori |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default `true` | Status aktif untuk ditampilkan di form publik |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu pembuatan data |

### 3.3 Tabel `profiles`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `REFERENCES auth.users(id)` | ID pengguna yang terhubung ke Supabase Auth |
| `full_name` | `TEXT` | `NOT NULL` | Nama lengkap petugas atau Admin RW |
| `role` | `TEXT` | `NOT NULL`, `CHECK` | Hanya bernilai `'admin_rw'` atau `'petugas_kebersihan'` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu pembuatan akun |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu pembaruan terakhir |

### 3.4 Tabel `reports`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | ID unik laporan |
| `report_number` | `TEXT` | `NOT NULL`, `UNIQUE` | Nomor laporan unik (contoh: `'SMP-20261114-4821'`) |
| `rt_id` | `UUID` | `NOT NULL`, `REFERENCES rt_areas(id)` | Relasi wilayah RT lokasi laporan |
| `category_id` | `UUID` | `NOT NULL`, `REFERENCES categories(id)` | Relasi kategori sampah |
| `reporter_name` | `TEXT` | `NULLABLE` | Nama pelapor (opsional) |
| `reporter_phone` | `TEXT` | `NULLABLE` | Nomor telepon pelapor (opsional) |
| `title` | `TEXT` | `NOT NULL` | Judul singkat laporan |
| `description` | `TEXT` | `NOT NULL` | Deskripsi detail masalah sampah |
| `address` | `TEXT` | `NOT NULL` | Patokan alamat lokasi sampah |
| `latitude` | `NUMERIC(10,7)` | `NOT NULL` | Titik koordinat lintang (Leaflet Map) |
| `longitude` | `NUMERIC(10,7)` | `NOT NULL` | Titik koordinat bujur (Leaflet Map) |
| `status` | `TEXT` | `NOT NULL`, Default `'Menunggu Verifikasi'` | Status terkini laporan (5 status resmi) |
| `rejection_reason` | `TEXT` | `NULLABLE` | Alasan penolakan (wajib diisi jika `status = 'Ditolak'`) |
| `forwarded_at` | `TIMESTAMPTZ` | `NULLABLE` | Waktu laporan dikonfirmasi diteruskan ke pemerintah |
| `forwarded_by` | `UUID` | `NULLABLE`, `REFERENCES profiles(id)` | Akun Admin RW yang meneruskan laporan |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu pengiriman laporan |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu pembaruan terakhir |

### 3.5 Tabel `report_images`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | ID unik foto laporan |
| `report_id` | `UUID` | `NOT NULL`, `REFERENCES reports(id)` | Relasi ke laporan induk |
| `image_url` | `TEXT` | `NOT NULL` | URL publik/path file pada Supabase Storage |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu foto diunggah |

### 3.6 Tabel `report_access_tokens`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | ID unik token |
| `report_id` | `UUID` | `NOT NULL`, `UNIQUE`, `REFERENCES reports(id)` | Relasi $1:1$ ke laporan |
| `token_hash` | `TEXT` | `NOT NULL` | Bcrypt *hash* dari kode akses rahasia |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu pembuatan token |

### 3.7 Tabel `report_status_history`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | ID unik riwayat status |
| `report_id` | `UUID` | `NOT NULL`, `REFERENCES reports(id)` | Relasi ke laporan induk |
| `old_status` | `TEXT` | `NULLABLE` | Status sebelum perubahan (`NULL` saat baru dibuat) |
| `new_status` | `TEXT` | `NOT NULL` | Status baru setelah perubahan |
| `public_note` | `TEXT` | `NULLABLE` | Keterangan perkembangan untuk dilihat masyarakat |
| `internal_note` | `TEXT` | `NULLABLE` | Catatan internal Admin RW (rahasia, tidak tampil ke publik) |
| `changed_by` | `UUID` | `NULLABLE`, `REFERENCES profiles(id)` | Akun Admin RW pengubah (`NULL` saat dibuat oleh sistem) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu terjadinya perubahan status |

### 3.8 Tabel `collection_schedules`
| Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | ID unik jadwal pengangkutan |
| `area` | `TEXT` | `NOT NULL` | Wilayah atau area RT pengangkutan |
| `day` | `TEXT` | `NOT NULL` | Hari pengangkutan (contoh: `'Senin & Kamis'`) |
| `start_time` | `TIME` | `NOT NULL` | Jam mulai pengangkutan |
| `end_time` | `TIME` | `NULLABLE` | Jam selesai pengangkutan |
| `description` | `TEXT` | `NULLABLE` | Keterangan tambahan operasional |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default `true` | Status jadwal aktif/nonaktif |
| `updated_by` | `UUID` | `NULLABLE`, `REFERENCES profiles(id)` | Akun Petugas Kebersihan yang terakhir memperbarui |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu jadwal dibuat |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `now()` | Waktu jadwal terakhir diperbarui |

---

## 4. Script SQL Migrasi Lengkap (Siap Dijalankan di Supabase)

Salin dan jalankan script SQL di bawah ini pada menu **SQL Editor** di dashboard Supabase Anda:

```sql
-- ============================================================================
-- 1. EKSTENSI & FUNGSI UTILITAS DASAR
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fungsi otomatis untuk memperbarui kolom updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. PEMBUATAN 8 TABEL UTAMA (SESUAI ERD)
-- ============================================================================

-- 2.1 Tabel rt_areas
CREATE TABLE IF NOT EXISTS public.rt_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rt_number TEXT NOT NULL,
  rw_number TEXT NOT NULL,
  area_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Tabel categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Tabel profiles (Terhubung dengan auth.users Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin_rw', 'petugas_kebersihan')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.4 Tabel reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT NOT NULL UNIQUE,
  rt_id UUID NOT NULL REFERENCES public.rt_areas(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  reporter_name TEXT,
  reporter_phone TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Menunggu Verifikasi' CHECK (
    status IN (
      'Menunggu Verifikasi',
      'Ditolak',
      'Diteruskan ke Pemerintah',
      'Dalam Penanganan',
      'Selesai'
    )
  ),
  rejection_reason TEXT,
  forwarded_at TIMESTAMPTZ,
  forwarded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Validasi: Jika status Ditolak, alasan penolakan wajib terisi
  CONSTRAINT check_rejection_reason CHECK (
    (status <> 'Ditolak') OR (rejection_reason IS NOT NULL AND length(trim(rejection_reason)) > 0)
  )
);

CREATE TRIGGER set_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.5 Tabel report_images (Maksimal 5 foto per laporan)
CREATE TABLE IF NOT EXISTS public.report_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger pembatasan maksimal 5 foto per laporan
CREATE OR REPLACE FUNCTION public.enforce_max_report_images()
RETURNS TRIGGER AS $$
DECLARE
  img_count INTEGER;
BEGIN
  SELECT count(*) INTO img_count
  FROM public.report_images
  WHERE report_id = NEW.report_id;

  IF img_count >= 5 THEN
    RAISE EXCEPTION 'Maksimal hanya diperbolehkan 5 foto untuk setiap laporan.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_max_report_images
BEFORE INSERT ON public.report_images
FOR EACH ROW EXECUTE FUNCTION public.enforce_max_report_images();

-- 2.6 Tabel report_access_tokens
CREATE TABLE IF NOT EXISTS public.report_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES public.reports(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 Tabel report_status_history
CREATE TABLE IF NOT EXISTS public.report_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  public_note TEXT,
  internal_note TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 Tabel collection_schedules
CREATE TABLE IF NOT EXISTS public.collection_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL,
  day TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_schedules_updated_at
BEFORE UPDATE ON public.collection_schedules
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 3. INDEXING UNTUK OPTIMASI PERFORMA QUERY
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reports_report_number ON public.reports(report_number);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_rt_id ON public.reports(rt_id);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON public.reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON public.report_images(report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_report_id ON public.report_status_history(report_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_schedules_is_active ON public.collection_schedules(is_active);

-- ============================================================================
-- 4. KEBIJAKAN KEAMANAN ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Fungsi helper untuk memeriksa role user yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Aktifkan RLS di semua tabel
ALTER TABLE public.rt_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_schedules ENABLE ROW LEVEL SECURITY;

-- 4.1 Kebijakan RLS: rt_areas (Publik bisa baca daftar RT, Admin RW bisa kelola)
CREATE POLICY "Publik dapat melihat daftar RT"
  ON public.rt_areas FOR SELECT
  USING (true);

CREATE POLICY "Admin RW dapat mengelola RT"
  ON public.rt_areas FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'admin_rw')
  WITH CHECK (public.get_my_role() = 'admin_rw');

-- 4.2 Kebijakan RLS: categories (Publik baca kategori aktif, Admin RW baca/kelola semua)
CREATE POLICY "Publik dapat melihat kategori aktif"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.get_my_role() = 'admin_rw');

CREATE POLICY "Admin RW dapat mengelola kategori"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'admin_rw')
  WITH CHECK (public.get_my_role() = 'admin_rw');

-- 4.3 Kebijakan RLS: profiles (Pengguna internal dapat membaca profil sendiri & rekan)
CREATE POLICY "Pengguna internal dapat membaca profil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.get_my_role() IN ('admin_rw', 'petugas_kebersihan'));

CREATE POLICY "Pengguna internal dapat mengubah profil sendiri"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4.4 Kebijakan RLS: reports, report_images, report_status_history
-- PENTING: Publik TIDAK diberi akses SELECT langsung. Akses publik hanya via RPC.
CREATE POLICY "Hanya Admin RW yang dapat membaca seluruh tabel reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin_rw');

CREATE POLICY "Hanya Admin RW yang dapat memperbarui tabel reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin_rw')
  WITH CHECK (public.get_my_role() = 'admin_rw');

CREATE POLICY "Hanya Admin RW yang dapat membaca report_images secara langsung"
  ON public.report_images FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin_rw');

CREATE POLICY "Hanya Admin RW yang dapat membaca report_status_history secara langsung"
  ON public.report_status_history FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin_rw');

CREATE POLICY "Hanya Admin RW yang dapat menambah report_status_history"
  ON public.report_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin_rw');

-- 4.5 Kebijakan RLS: report_access_tokens (Sepenuhnya tertutup dari akses langsung)
-- Hanya dapat diakses oleh fungsi RPC internal berskema SECURITY DEFINER.

-- 4.6 Kebijakan RLS: collection_schedules
-- Publik & Admin RW hanya bisa SELECT. Hanya Petugas Kebersihan yang bisa INSERT/UPDATE/DELETE.
CREATE POLICY "Publik melihat jadwal aktif, Admin dan Petugas melihat semua jadwal"
  ON public.collection_schedules FOR SELECT
  USING (
    is_active = true
    OR public.get_my_role() IN ('admin_rw', 'petugas_kebersihan')
  );

CREATE POLICY "Petugas Kebersihan dapat menambah jadwal"
  ON public.collection_schedules FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'petugas_kebersihan');

CREATE POLICY "Petugas Kebersihan dapat mengubah jadwal"
  ON public.collection_schedules FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'petugas_kebersihan')
  WITH CHECK (public.get_my_role() = 'petugas_kebersihan');

CREATE POLICY "Petugas Kebersihan dapat menghapus jadwal"
  ON public.collection_schedules FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'petugas_kebersihan');

-- ============================================================================
-- 5. FUNGSI SERVER (POSTGRESQL RPC) UNTUK TRANSAKSI AMAN
-- ============================================================================

-- 5.1 RPC Publik: Mengirim Laporan Baru & Menghasilkan Nomor Laporan + Kode Akses
CREATE OR REPLACE FUNCTION public.submit_public_report(
  p_rt_id UUID,
  p_category_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_address TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_reporter_name TEXT DEFAULT NULL,
  p_reporter_phone TEXT DEFAULT NULL,
  p_image_urls TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_report_id UUID;
  v_report_number TEXT;
  v_access_code TEXT;
  v_img_url TEXT;
BEGIN
  -- 1. Validasi jumlah foto (maksimal 5)
  IF array_length(p_image_urls, 1) IS NOT NULL AND array_length(p_image_urls, 1) > 5 THEN
    RAISE EXCEPTION 'Maksimal hanya dapat mengunggah 5 foto bukti.';
  END IF;

  -- 2. Generate Nomor Laporan unik (Format: SMP-YYYYMMDD-4DigitRandom)
  LOOP
    v_report_number := 'SMP-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.reports WHERE report_number = v_report_number);
  END LOOP;

  -- 3. Generate Kode Akses Rahasia 6 karakter alfanumerik huruf besar
  v_access_code := upper(substr(replace(encode(gen_random_bytes(6), 'base64'), '/', 'X'), 1, 6));

  -- 4. Simpan ke tabel reports
  INSERT INTO public.reports (
    report_number, rt_id, category_id, reporter_name, reporter_phone,
    title, description, address, latitude, longitude, status
  ) VALUES (
    v_report_number, p_rt_id, p_category_id, nullif(trim(p_reporter_name), ''), nullif(trim(p_reporter_phone), ''),
    trim(p_title), trim(p_description), trim(p_address), p_latitude, p_longitude, 'Menunggu Verifikasi'
  ) RETURNING id INTO v_report_id;

  -- 5. Simpan hash kode akses menggunakan algoritma Blowfish (bcrypt)
  INSERT INTO public.report_access_tokens (report_id, token_hash)
  VALUES (v_report_id, crypt(v_access_code, gen_salt('bf')));

  -- 6. Simpan daftar URL foto jika ada
  IF array_length(p_image_urls, 1) IS NOT NULL THEN
    FOREACH v_img_url IN ARRAY p_image_urls LOOP
      INSERT INTO public.report_images (report_id, image_url)
      VALUES (v_report_id, v_img_url);
    END LOOP;
  END IF;

  -- 7. Catat riwayat status awal
  INSERT INTO public.report_status_history (
    report_id, old_status, new_status, public_note
  ) VALUES (
    v_report_id, NULL, 'Menunggu Verifikasi', 'Laporan berhasil diterima oleh sistem dan menunggu verifikasi Admin RW.'
  );

  -- 8. Kembalikan Nomor Laporan & Kode Akses (Hanya tampil 1 kali di layar konfirmasi)
  RETURN jsonb_build_object(
    'report_id', v_report_id,
    'report_number', v_report_number,
    'access_code', v_access_code,
    'status', 'Menunggu Verifikasi'
  );
END;
$$;

-- 5.2 RPC Publik: Memeriksa Status Laporan dengan Nomor Laporan & Kode Akses
CREATE OR REPLACE FUNCTION public.get_public_report_status(
  p_report_number TEXT,
  p_access_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_report RECORD;
  v_token_hash TEXT;
  v_images JSONB;
  v_history JSONB;
BEGIN
  -- 1. Cari laporan dan hash tokennya
  SELECT
    r.id, r.report_number, r.title, r.description, r.address,
    r.latitude, r.longitude, r.status, r.rejection_reason,
    r.created_at, r.updated_at,
    c.name AS category_name,
    rt.rt_number, rt.rw_number, rt.area_name,
    rat.token_hash
  INTO v_report
  FROM public.reports r
  JOIN public.categories c ON c.id = r.category_id
  JOIN public.rt_areas rt ON rt.id = r.rt_id
  JOIN public.report_access_tokens rat ON rat.report_id = r.id
  WHERE upper(trim(r.report_number)) = upper(trim(p_report_number));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Laporan tidak ditemukan atau kombinasi Nomor Laporan dan Kode Akses tidak sesuai.';
  END IF;

  -- 2. Verifikasi kecocokan Kode Akses dengan hash bcrypt
  IF v_report.token_hash <> crypt(upper(trim(p_access_code)), v_report.token_hash) THEN
    RAISE EXCEPTION 'Laporan tidak ditemukan atau kombinasi Nomor Laporan dan Kode Akses tidak sesuai.';
  END IF;

  -- 3. Ambil daftar foto bukti laporan
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'image_url', image_url)), '[]'::jsonb)
  INTO v_images
  FROM public.report_images
  WHERE report_id = v_report.id;

  -- 4. Ambil riwayat status (HANYA public_note, TANPA internal_note & changed_by)
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'old_status', old_status,
        'new_status', new_status,
        'public_note', public_note,
        'created_at', created_at
      ) ORDER BY created_at ASC
    ),
    '[]'::jsonb
  )
  INTO v_history
  FROM public.report_status_history
  WHERE report_id = v_report.id;

  -- 5. Kembalikan data yang aman untuk dikonsumsi publik
  RETURN jsonb_build_object(
    'report_number', v_report.report_number,
    'title', v_report.title,
    'category_name', v_report.category_name,
    'rt_number', v_report.rt_number,
    'rw_number', v_report.rw_number,
    'area_name', v_report.area_name,
    'description', v_report.description,
    'address', v_report.address,
    'latitude', v_report.latitude,
    'longitude', v_report.longitude,
    'status', v_report.status,
    'rejection_reason', v_report.rejection_reason,
    'created_at', v_report.created_at,
    'updated_at', v_report.updated_at,
    'images', v_images,
    'history', v_history
  );
END;
$$;

-- 5.3 RPC Admin RW: Memperbarui Status Laporan (Tolak, Konfirmasi WA, Penanganan, Selesai)
CREATE OR REPLACE FUNCTION public.admin_update_report_status(
  p_report_id UUID,
  p_new_status TEXT,
  p_public_note TEXT DEFAULT NULL,
  p_internal_note TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  -- Pastikan pemanggil adalah Admin RW
  IF public.get_my_role() <> 'admin_rw' THEN
    RAISE EXCEPTION 'Akses ditolak. Hanya Admin RW yang dapat memperbarui status laporan.';
  END IF;

  SELECT status INTO v_old_status FROM public.reports WHERE id = p_report_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Data laporan tidak ditemukan.';
  END IF;

  -- Validasi khusus jika ditolak
  IF p_new_status = 'Ditolak' AND (p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0) THEN
    RAISE EXCEPTION 'Alasan penolakan wajib diisi ketika menolak laporan.';
  END IF;

  -- Perbarui tabel reports
  UPDATE public.reports
  SET
    status = p_new_status,
    rejection_reason = CASE WHEN p_new_status = 'Ditolak' THEN trim(p_rejection_reason) ELSE rejection_reason END,
    forwarded_at = CASE WHEN p_new_status = 'Diteruskan ke Pemerintah' AND forwarded_at IS NULL THEN now() ELSE forwarded_at END,
    forwarded_by = CASE WHEN p_new_status = 'Diteruskan ke Pemerintah' AND forwarded_by IS NULL THEN auth.uid() ELSE forwarded_by END
  WHERE id = p_report_id;

  -- Simpan ke tabel report_status_history
  INSERT INTO public.report_status_history (
    report_id, old_status, new_status, public_note, internal_note, changed_by
  ) VALUES (
    p_report_id,
    v_old_status,
    p_new_status,
    CASE
      WHEN p_new_status = 'Ditolak' AND p_public_note IS NULL THEN 'Laporan ditolak: ' || trim(p_rejection_reason)
      ELSE nullif(trim(p_public_note), '')
    END,
    nullif(trim(p_internal_note), ''),
    auth.uid()
  );
END;
$$;
```

---

## 5. Konfigurasi Supabase Storage (Bucket Foto Laporan)

Jalankan script berikut di **SQL Editor** untuk menyiapkan bucket penyimpanan foto bukti laporan (`report-images`):

```sql
-- Membuat bucket storage 'report-images' dengan batas ukuran 5MB per file
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Mengizinkan masyarakat publik mengunggah foto bukti laporan
CREATE POLICY "Publik dapat mengunggah foto laporan"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images');

-- Mengizinkan tampilan gambar bukti laporan diakses melalui URL gambarnya
CREATE POLICY "Foto laporan dapat dilihat"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');
```

---

## 6. Data Awal (Seed Data Wilayah RT & Kategori Sampah)

Jalankan script berikut untuk mengisi data awal wilayah RT (cakupan 1 RW di Batam) serta kategori permasalahan sampah:

```sql
-- 6.1 Seed Data Wilayah RT dalam 1 RW
INSERT INTO public.rt_areas (rt_number, rw_number, area_name) VALUES
  ('RT 01', 'RW 05', 'Blok A - Perumahan Batam Nirwana'),
  ('RT 02', 'RW 05', 'Blok B - Perumahan Batam Nirwana'),
  ('RT 03', 'RW 05', 'Blok C - Area Taman & Fasilitas Umum'),
  ('RT 04', 'RW 05', 'Blok D - Jalan Utama & Ruko')
ON CONFLICT DO NOTHING;

-- 6.2 Seed Data Kategori Permasalahan Sampah
INSERT INTO public.categories (name, description, is_active) VALUES
  ('Sampah Menumpuk', 'Tumpukan sampah rumah tangga atau plastik yang melebihi kapasitas tempat sampah.', true),
  ('Keterlambatan Pengangkutan', 'Sampah belum diangkut oleh petugas melewati jadwal pengangkutan rutin.', true),
  ('Pembuangan Sampah Liar', 'Tumpukan sampah di pinggir jalan, lahan kosong, atau tempat tidak semestinya.', true),
  ('Sampah Menyumbat Saluran Air', 'Sampah yang menumpuk di drainase atau parit dan berpotensi menyebabkan banjir.', true),
  ('Bau & Gangguan Lingkungan', 'Sampah membusuk yang menimbulkan bau menyengat dan mengganggu warga sekitar.', true)
ON CONFLICT (name) DO NOTHING;
```