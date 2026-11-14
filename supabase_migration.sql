-- ============================================================================
-- SKRIP MIGRASI LENGKAP SUPABASE - SAMPURA
-- Eksekusi file ini di SQL Editor Dashboard Supabase
-- ============================================================================

-- 1. EKSTENSI & FUNGSI UTILITAS DASAR
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. PEMBUATAN 8 TABEL UTAMA (SESUAI ERD)

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

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
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
  CONSTRAINT check_rejection_reason CHECK (
    (status <> 'Ditolak') OR (rejection_reason IS NOT NULL AND length(trim(rejection_reason)) > 0)
  )
);

DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
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

DROP TRIGGER IF EXISTS check_max_report_images ON public.report_images;
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

DROP TRIGGER IF EXISTS set_schedules_updated_at ON public.collection_schedules;
CREATE TRIGGER set_schedules_updated_at
BEFORE UPDATE ON public.collection_schedules
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. INDEXING UNTUK OPTIMASI PERFORMA QUERY
CREATE INDEX IF NOT EXISTS idx_reports_report_number ON public.reports(report_number);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_rt_id ON public.reports(rt_id);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON public.reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON public.report_images(report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_report_id ON public.report_status_history(report_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_schedules_is_active ON public.collection_schedules(is_active);

-- 4. KEBIJAKAN KEAMANAN ROW LEVEL SECURITY (RLS)

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE public.rt_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_schedules ENABLE ROW LEVEL SECURITY;

-- 4.1 RLS rt_areas
DROP POLICY IF EXISTS "Publik dapat melihat daftar RT" ON public.rt_areas;
CREATE POLICY "Publik dapat melihat daftar RT"
  ON public.rt_areas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin RW dapat mengelola RT" ON public.rt_areas;
CREATE POLICY "Admin RW dapat mengelola RT"
  ON public.rt_areas FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'admin_rw')
  WITH CHECK (public.get_my_role() = 'admin_rw');

-- 4.2 RLS categories
DROP POLICY IF EXISTS "Publik dapat melihat kategori aktif" ON public.categories;
CREATE POLICY "Publik dapat melihat kategori aktif"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.get_my_role() = 'admin_rw');

DROP POLICY IF EXISTS "Admin RW dapat mengelola kategori" ON public.categories;
CREATE POLICY "Admin RW dapat mengelola kategori"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.get_my_role() = 'admin_rw')
  WITH CHECK (public.get_my_role() = 'admin_rw');

-- 4.3 RLS profiles
DROP POLICY IF EXISTS "Pengguna internal dapat membaca profil" ON public.profiles;
CREATE POLICY "Pengguna internal dapat membaca profil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.get_my_role() IN ('admin_rw', 'petugas_kebersihan'));

DROP POLICY IF EXISTS "Pengguna internal dapat mengubah profil sendiri" ON public.profiles;
CREATE POLICY "Pengguna internal dapat mengubah profil sendiri"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Pengguna dapat membuat profil sendiri" ON public.profiles;
CREATE POLICY "Pengguna dapat membuat profil sendiri"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 4.4 RLS reports, report_images, report_status_history
DROP POLICY IF EXISTS "Hanya Admin RW yang dapat membaca seluruh tabel reports" ON public.reports;
CREATE POLICY "Hanya Admin RW yang dapat membaca seluruh tabel reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin_rw');

DROP POLICY IF EXISTS "Hanya Admin RW yang dapat memperbarui tabel reports" ON public.reports;
CREATE POLICY "Hanya Admin RW yang dapat memperbarui tabel reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin_rw')
  WITH CHECK (public.get_my_role() = 'admin_rw');

DROP POLICY IF EXISTS "Hanya Admin RW yang dapat membaca report_images secara langsung" ON public.report_images;
CREATE POLICY "Hanya Admin RW yang dapat membaca report_images secara langsung"
  ON public.report_images FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin_rw');

DROP POLICY IF EXISTS "Hanya Admin RW yang dapat membaca report_status_history secara langsung" ON public.report_status_history;
CREATE POLICY "Hanya Admin RW yang dapat membaca report_status_history secara langsung"
  ON public.report_status_history FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin_rw');

DROP POLICY IF EXISTS "Hanya Admin RW yang dapat menambah report_status_history" ON public.report_status_history;
CREATE POLICY "Hanya Admin RW yang dapat menambah report_status_history"
  ON public.report_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin_rw');

-- 4.5 RLS collection_schedules
DROP POLICY IF EXISTS "Publik melihat jadwal aktif, Admin dan Petugas melihat semua jadwal" ON public.collection_schedules;
CREATE POLICY "Publik melihat jadwal aktif, Admin dan Petugas melihat semua jadwal"
  ON public.collection_schedules FOR SELECT
  USING (
    is_active = true
    OR public.get_my_role() IN ('admin_rw', 'petugas_kebersihan')
  );

DROP POLICY IF EXISTS "Petugas Kebersihan dapat menambah jadwal" ON public.collection_schedules;
CREATE POLICY "Petugas Kebersihan dapat menambah jadwal"
  ON public.collection_schedules FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'petugas_kebersihan');

DROP POLICY IF EXISTS "Petugas Kebersihan dapat mengubah jadwal" ON public.collection_schedules;
CREATE POLICY "Petugas Kebersihan dapat mengubah jadwal"
  ON public.collection_schedules FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'petugas_kebersihan')
  WITH CHECK (public.get_my_role() = 'petugas_kebersihan');

DROP POLICY IF EXISTS "Petugas Kebersihan dapat menghapus jadwal" ON public.collection_schedules;
CREATE POLICY "Petugas Kebersihan dapat menghapus jadwal"
  ON public.collection_schedules FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'petugas_kebersihan');

-- 5. FUNGSI SERVER (POSTGRESQL RPC) UNTUK TRANSAKSI AMAN

-- 5.1 submit_public_report
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
  IF array_length(p_image_urls, 1) IS NOT NULL AND array_length(p_image_urls, 1) > 5 THEN
    RAISE EXCEPTION 'Maksimal hanya dapat mengunggah 5 foto bukti.';
  END IF;

  LOOP
    v_report_number := 'SMP-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.reports WHERE report_number = v_report_number);
  END LOOP;

  v_access_code := upper(substr(replace(encode(gen_random_bytes(6), 'base64'), '/', 'X'), 1, 6));

  INSERT INTO public.reports (
    report_number, rt_id, category_id, reporter_name, reporter_phone,
    title, description, address, latitude, longitude, status
  ) VALUES (
    v_report_number, p_rt_id, p_category_id, nullif(trim(p_reporter_name), ''), nullif(trim(p_reporter_phone), ''),
    trim(p_title), trim(p_description), trim(p_address), p_latitude, p_longitude, 'Menunggu Verifikasi'
  ) RETURNING id INTO v_report_id;

  INSERT INTO public.report_access_tokens (report_id, token_hash)
  VALUES (v_report_id, crypt(v_access_code, gen_salt('bf')));

  IF array_length(p_image_urls, 1) IS NOT NULL THEN
    FOREACH v_img_url IN ARRAY p_image_urls LOOP
      INSERT INTO public.report_images (report_id, image_url)
      VALUES (v_report_id, v_img_url);
    END LOOP;
  END IF;

  INSERT INTO public.report_status_history (
    report_id, old_status, new_status, public_note
  ) VALUES (
    v_report_id, NULL, 'Menunggu Verifikasi', 'Laporan berhasil diterima oleh sistem dan menunggu verifikasi Admin RW.'
  );

  RETURN jsonb_build_object(
    'report_id', v_report_id,
    'report_number', v_report_number,
    'access_code', v_access_code,
    'status', 'Menunggu Verifikasi'
  );
END;
$$;

-- 5.2 get_public_report_status
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

  IF v_report.token_hash <> crypt(upper(trim(p_access_code)), v_report.token_hash) THEN
    RAISE EXCEPTION 'Laporan tidak ditemukan atau kombinasi Nomor Laporan dan Kode Akses tidak sesuai.';
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'image_url', image_url)), '[]'::jsonb)
  INTO v_images
  FROM public.report_images
  WHERE report_id = v_report.id;

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

-- 5.3 admin_update_report_status
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
  IF public.get_my_role() <> 'admin_rw' THEN
    RAISE EXCEPTION 'Akses ditolak. Hanya Admin RW yang dapat memperbarui status laporan.';
  END IF;

  SELECT status INTO v_old_status FROM public.reports WHERE id = p_report_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Data laporan tidak ditemukan.';
  END IF;

  IF p_new_status = 'Ditolak' AND (p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0) THEN
    RAISE EXCEPTION 'Alasan penolakan wajib diisi ketika menolak laporan.';
  END IF;

  UPDATE public.reports
  SET
    status = p_new_status,
    rejection_reason = CASE WHEN p_new_status = 'Ditolak' THEN trim(p_rejection_reason) ELSE rejection_reason END,
    forwarded_at = CASE WHEN p_new_status = 'Diteruskan ke Pemerintah' AND forwarded_at IS NULL THEN now() ELSE forwarded_at END,
    forwarded_by = CASE WHEN p_new_status = 'Diteruskan ke Pemerintah' AND forwarded_by IS NULL THEN auth.uid() ELSE forwarded_by END
  WHERE id = p_report_id;

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

-- 6. STORAGE BUCKET UNTUK FOTO BUKTI LAPORAN
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Publik dapat mengunggah foto laporan" ON storage.objects;
CREATE POLICY "Publik dapat mengunggah foto laporan"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Foto laporan dapat dilihat" ON storage.objects;
CREATE POLICY "Foto laporan dapat dilihat"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');

-- 7. SEED DATA AWAL (WILAYAH RT & KATEGORI SAMPAH)
INSERT INTO public.rt_areas (rt_number, rw_number, area_name) VALUES
  ('RT 01', 'RW 05', 'Blok A - Perumahan Batam Nirwana'),
  ('RT 02', 'RW 05', 'Blok B - Perumahan Batam Nirwana'),
  ('RT 03', 'RW 05', 'Blok C - Area Taman & Fasilitas Umum'),
  ('RT 04', 'RW 05', 'Blok D - Jalan Utama & Ruko')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, description, is_active) VALUES
  ('Sampah Menumpuk', 'Tumpukan sampah rumah tangga atau plastik yang melebihi kapasitas tempat sampah.', true),
  ('Keterlambatan Pengangkutan', 'Sampah belum diangkut oleh petugas melewati jadwal pengangkutan rutin.', true),
  ('Pembuangan Sampah Liar', 'Tumpukan sampah di pinggir jalan, lahan kosong, atau tempat tidak semestinya.', true),
  ('Sampah Menyumbat Saluran Air', 'Sampah yang menumpuk di drainase atau parit dan berpotensi menyebabkan banjir.', true),
  ('Bau & Gangguan Lingkungan', 'Sampah membusuk yang menimbulkan bau menyengat dan mengganggu warga sekitar.', true)
ON CONFLICT (name) DO NOTHING;
