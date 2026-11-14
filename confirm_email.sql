-- ============================================================================
-- KONFIRMASI EMAIL & AKTIVASI PROFIL ADMIN RW (MARESH)
-- Jalankan di SQL Editor Supabase
-- ============================================================================

-- 1. Aktifkan dan konfirmasi email secara instan
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'lionacullenj@gmail.com';

-- 2. Pastikan profil Maresh terdaftar sebagai role admin_rw
INSERT INTO public.profiles (id, full_name, role)
SELECT id, 'Maresh', 'admin_rw'
FROM auth.users
WHERE email = 'lionacullenj@gmail.com'
ON CONFLICT (id) DO UPDATE SET full_name = 'Maresh', role = 'admin_rw';
