-- ============================================================================
-- SKRIP PEMBUATAN AKUN ADMIN RW (MARESH)
-- Salin seluruh isi skrip ini ke SQL Editor Dashboard Supabase, lalu klik Run
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Cek apakah user sudah terdaftar di auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'lionacullenj@gmail.com';

  -- 2. Jika belum ada, buat akun baru di auth.users
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'lionacullenj@gmail.com',
      crypt('123456', gen_salt('bf')),
      now(), -- Email langsung aktif tanpa verifikasi link
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Maresh","role":"admin_rw"}'::jsonb,
      now(),
      now(),
      ''
    );

    -- Sinkronisasi ke auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'lionacullenj@gmail.com'),
      'email',
      'lionacullenj@gmail.com',
      now(),
      now(),
      now()
    ) ON CONFLICT DO NOTHING;

  ELSE
    -- Jika sudah ada, update password dan konfirmasi email
    UPDATE auth.users
    SET 
      encrypted_password = crypt('123456', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = '{"full_name":"Maresh","role":"admin_rw"}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- 3. Masukkan profil ke tabel public.profiles sebagai role admin_rw
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (v_user_id, 'Maresh', 'admin_rw')
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Maresh', role = 'admin_rw';

  RAISE NOTICE 'Akun Admin RW Maresh (lionacullenj@gmail.com) berhasil dibuat/diperbarui!';
END $$;
