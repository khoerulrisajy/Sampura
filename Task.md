# Task List Pengembangan Proyek: SAMPURA
**Platform Pengaduan dan Informasi Pengangkutan Sampah**  
**Cakupan Awal:** Satu RW (Beberapa RT) — Wilayah Perkotaan Batam  
**Acuan Dokumen:** PRD v1.4/v1.5, Diagram ERD (8 Tabel), & UI/UX Design System

---

## Panduan Referensi Cepat (Quick Reference)
* **Tech Stack Front-End:** React.js (Vite), Tailwind CSS, React Router DOM, Leaflet.js + OpenStreetMap, Lucide React
* **Tech Stack Back-End:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Edge Functions / PostgreSQL RPC)
* **Design System:**
  * **Warna:** Hijau Tua (`#2C6705`), Hijau Muda (`#6BA24B`), Cream (`#F8F9F4`), Abu Gelap (`#2E2E2E`)
  * **Tipografi:** Poppins (`SemiBold` untuk Heading, `Medium` untuk Subheading, `Regular` untuk Body Text)
  * **Spacing:** `24px` konsisten antar elemen utama
* **Daftar Role Sistem:**
  * `public` (Masyarakat — Tanpa Login, akses via Nomor Laporan + Kode Akses Rahasia)
  * `admin_rw` (Admin RW — Verifikasi laporan, tolak, teruskan ke WA Pemerintah, update status)
  * `petugas_kebersihan` (Petugas Kebersihan — CRUD & aktivasi jadwal pengangkutan sampah)

---

## Fase 0: Persiapan & Inisialisasi Proyek (Setup & Environment)
- [ ] **0.1 Inisialisasi Repository & Proyek Front-End**
  - [ ] Buat repository Git & hubungkan ke GitHub.
  - [ ] Inisialisasi proyek React.js menggunakan Vite (`npm create vite@latest`).
  - [ ] Instal dependensi utama: `tailwindcss`, `react-router-dom`, `lucide-react`, `leaflet`, `react-leaflet`, dan `@supabase/supabase-js`.
- [ ] **0.2 Konfigurasi Design System di Tailwind CSS**
  - [ ] Impor Google Fonts **Poppins** (400 Regular, 500 Medium, 600 SemiBold) pada `index.html` / CSS utama.
  - [ ] Daftarkan palet warna kustom di `tailwind.config.js`:
    - `primary`: `#2C6705` (Hijau Tua)
    - `secondary`: `#6BA24B` (Hijau Muda)
    - `surface`: `#F8F9F4` (Cream)
    - `dark`: `#2E2E2E` (Abu Gelap)
- [ ] **0.3 Konfigurasi Proyek Supabase**
  - [ ] Buat proyek baru di dashboard Supabase.
  - [ ] Siapkan file `.env.local` di Front-End untuk menyimpan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (pastikan `service_role_key` **tidak** pernah diletakkan di kode Front-End).
  - [ ] Buat helper koneksi client Supabase (`src/lib/supabaseClient.js`).

---

## Fase 1: Back-End & Database (Supabase Core — Priority 1)
### 1.1 Pembuatan Skema Tabel Database (Sesuai ERD 8 Tabel)
- [ ] **Tabel `rt_areas`**: `id` (UUID, PK), `rt_number` (TEXT), `rw_number` (TEXT), `area_name` (TEXT), `created_at` (TIMESTAMPTZ).
- [ ] **Tabel `categories`**: `id` (UUID, PK), `name` (TEXT), `description` (TEXT), `is_active` (BOOLEAN), `created_at` (TIMESTAMPTZ).
- [ ] **Tabel `profiles`**: `id` (UUID, PK, FK ke `auth.users`), `full_name` (TEXT), `role` (TEXT: `'admin_rw'` atau `'petugas_kebersihan'`), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
- [ ] **Tabel `reports`**:
  - `id` (UUID, PK)
  - `report_number` (TEXT, Unique)
  - `rt_id` (UUID, FK ke `rt_areas.id`)
  - `category_id` (UUID, FK ke `categories.id`)
  - `reporter_name` (TEXT, Nullable/Opsional)
  - `reporter_phone` (TEXT, Nullable/Opsional)
  - `title` (TEXT, Not Null)
  - `description` (TEXT, Not Null)
  - `address` (TEXT, Not Null)
  - `latitude` (NUMERIC, Not Null)
  - `longitude` (NUMERIC, Not Null)
  - `status` (TEXT, Default: `'Menunggu Verifikasi'`)
  - `rejection_reason` (TEXT, Nullable)
  - `forwarded_at` (TIMESTAMPTZ, Nullable)
  - `forwarded_by` (UUID, FK ke `profiles.id`, Nullable)
  - `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
- [ ] **Tabel `report_images`**: `id` (UUID, PK), `report_id` (UUID, FK ke `reports.id`), `image_url` (TEXT), `created_at` (TIMESTAMPTZ).
- [ ] **Tabel `report_access_tokens`**: `id` (UUID, PK), `report_id` (UUID, FK ke `reports.id`), `token_hash` (TEXT), `created_at` (TIMESTAMPTZ).
- [ ] **Tabel `report_status_history`**:
  - `id` (UUID, PK)
  - `report_id` (UUID, FK ke `reports.id`)
  - `old_status` (TEXT, Nullable)
  - `new_status` (TEXT, Not Null)
  - `public_note` (TEXT, Nullable)
  - `internal_note` (TEXT, Nullable)
  - `changed_by` (UUID, FK ke `profiles.id`, Nullable)
  - `created_at` (TIMESTAMPTZ)
- [ ] **Tabel `collection_schedules`**:
  - `id` (UUID, PK)
  - `area` (TEXT, Not Null)
  - `day` (TEXT, Not Null)
  - `start_time` (TIME, Not Null)
  - `end_time` (TIME, Nullable)
  - `description` (TEXT, Nullable)
  - `is_active` (BOOLEAN, Default: `true`)
  - `updated_by` (UUID, FK ke `profiles.id`)
  - `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)

### 1.2 Penyimpanan File & Seeding Data Awal
- [ ] **Supabase Storage**: Buat bucket `report-images` dengan pembatasan tipe file gambar (`image/jpeg`, `image/png`, `image/webp`) dan batas ukuran per file.
- [ ] **Data Seeding**:
  - [ ] Isi data awal daftar RT dalam cakupan RW pada tabel `rt_areas`.
  - [ ] Isi daftar kategori masalah sampah awal pada tabel `categories`.
  - [ ] Buat 1 akun `admin_rw` dan 1 akun `petugas_kebersihan` di Supabase Auth beserta datanya di tabel `profiles`.

### 1.3 Keamanan Row Level Security (RLS) & Fungsi Server (RPC / Edge Functions)
- [ ] **Aktifkan RLS pada seluruh 8 tabel.**
- [ ] **Kebijakan RLS Tabel Master (`rt_areas`, `categories`, `collection_schedules`)**:
  - [ ] Publik hanya bisa membaca (`SELECT`) kategori dan jadwal yang berstatus `is_active = true`, serta membaca daftar `rt_areas`.
  - [ ] Hanya role `petugas_kebersihan` yang diizinkan melakukan `INSERT`, `UPDATE`, atau `DELETE` pada `collection_schedules`.
- [ ] **Kebijakan RLS Tabel Laporan (`reports`, `report_images`, `report_status_history`, `report_access_tokens`)**:
  - [ ] Blokir akses `SELECT` publik secara langsung ke tabel `reports`, `report_access_tokens`, dan `report_status_history`.
  - [ ] Berikan akses `SELECT` dan `UPDATE` penuh kepada pengguna terautentikasi dengan role `admin_rw`.
- [ ] **Fungsi Server 1 — Pengiriman Laporan Publik (`submit_public_report`)**:
  - [ ] Validasi input wajib dan batasi maksimal 5 foto per laporan.
  - [ ] Generate `report_number` unik otomatis (contoh: `SMP-20261114-XXXX`).
  - [ ] Generate **Kode Akses Rahasia** acak (plain text) dan simpan hasil hash-nya (`token_hash` menggunakan ekstensi `pgcrypto`) ke tabel `report_access_tokens`.
  - [ ] Simpan data ke `reports`, `report_images`, dan buat log awal di `report_status_history` dengan `new_status = 'Menunggu Verifikasi'`.
  - [ ] Kembalikan `report_number` dan `access_code` (plain text) satu kali ke response Front-End.
- [ ] **Fungsi Server 2 — Cek Status Laporan Publik (`get_public_report_status`)**:
  - [ ] Terima parameter `report_number` dan `access_code`.
  - [ ] Cocokkan `access_code` dengan `token_hash` di tabel `report_access_tokens`.
  - [ ] Jika cocok, kembalikan detail laporan publik, foto laporan, alasan penolakan (jika ada), serta riwayat status yang **hanya** memuat `public_note` (sembunyikan `internal_note` dan identitas admin).

---

## Fase 2: Front-End — Komponen Dasar & Routing (Priority 1)
- [ ] **2.1 Struktur Routing (`React Router DOM`)**
  - [ ] Rute Publik: `/`, `/lapor`, `/konfirmasi`, `/cek-status`, `/jadwal`, `/tentang`, `/faq`, `/kontak`, `/panduan`.
  - [ ] Rute Auth Internal: `/login`.
  - [ ] Rute Terproteksi Admin RW (`ProtectedRoute` khusus `admin_rw`): `/admin/dashboard`, `/admin/laporan`, `/admin/laporan/:id`, `/admin/jadwal`.
  - [ ] Rute Terproteksi Petugas (`ProtectedRoute` khusus `petugas_kebersihan`): `/petugas/dashboard`, `/petugas/jadwal`.
- [ ] **2.2 Pembuatan Komponen UI Reusable**
  - [ ] `Navbar` & `Footer` responsif untuk halaman publik, serta `Sidebar`/`Topbar` untuk dashboard internal.
  - [ ] `StatusBadge`: Komponen warna konsisten untuk 5 status (*Menunggu Verifikasi*, *Ditolak*, *Diteruskan ke Pemerintah*, *Dalam Penanganan*, *Selesai*).
  - [ ] `StatusTimeline`: Komponen vertikal penampil riwayat perkembangan laporan.
  - [ ] `MapPicker` & `MapViewer`: Komponen peta interaktif menggunakan Leaflet.js & OpenStreetMap untuk memilih dan menampilkan koordinat lokasi sampah.
  - [ ] `ImageUploader`: Komponen unggah foto dengan preview dan pembatasan maksimal 5 foto.
  - [ ] `ConfirmModal` & `ToastNotification`: Modal konfirmasi tindakan dan notifikasi berhasil/gagal.

---

## Fase 3: Front-End — Website Publik Masyarakat (Priority 1 & 2)
- [ ] **3.1 Halaman Beranda (`/`)**
  - [ ] Hero section dengan tagline *"BERSAMA JAGA LINGKUNGAN"* dan tombol CTA *"Lapor Sampah"*.
  - [ ] Bagian penjelasan singkat tentang Sampura dan 3 nilai utama (*Mudah, Transparan, Terkoordinasi*).
  - [ ] Bagian visualisasi alur cara kerja platform (*Lapor $\rightarrow$ Informasi $\rightarrow$ Pantau $\rightarrow$ Tindak Lanjut*).
  - [ ] Akses cepat ke halaman Jadwal Pengangkutan dan Cek Status Laporan.
- [ ] **3.2 Halaman Lapor Sampah (`/lapor`)**
  - [ ] Form pengaduan tanpa login: Nama Pelapor (opsional), Nomor Telepon (opsional), Pilih RT (wajib), Kategori Sampah (wajib), Judul Laporan (wajib), Deskripsi (wajib), Alamat (wajib), Titik Koordinat Peta (wajib), Upload Foto (opsional, maks 5 foto).
  - [ ] Validasi form client-side dan tampilkan **Modal Konfirmasi Ringkasan Laporan** sebelum benar-benar dikirim.
  - [ ] Integrasi unggah foto ke Supabase Storage dan pemanggilan fungsi `submit_public_report`.
- [ ] **3.3 Halaman Konfirmasi Laporan (`/konfirmasi`)**
  - [ ] Tampilkan pesan berhasil, **Nomor Laporan**, dan **Kode Akses Rahasia**.
  - [ ] Sediakan tombol *Salin (Copy)* untuk Nomor Laporan dan Kode Akses serta peringatan jelas bahwa kode akses hanya tampil satu kali.
  - [ ] Tombol navigasi menuju halaman Cek Status Laporan atau kembali ke Beranda.
- [ ] **3.4 Halaman Cek Status Laporan / Laporan Saya (`/cek-status`)**
  - [ ] Form input **Nomor Laporan** dan **Kode Akses Rahasia**.
  - [ ] Tampilkan detail laporan (Judul, Kategori, RT/Lokasi, Tanggal Kirim, Foto Bukti, Status Terkini).
  - [ ] Tampilkan kotak informasi khusus **Alasan Penolakan** apabila laporan berstatus *Ditolak*.
  - [ ] Tampilkan timeline riwayat perubahan status beserta waktu dan `public_note`.
- [ ] **3.5 Halaman Jadwal Pengangkutan Sampah (`/jadwal`)**
  - [ ] Tampilkan daftar jadwal pengangkutan yang aktif (`is_active = true`) meliputi Area/RT, Hari, Jam Mulai–Selesai, dan Keterangan.
  - [ ] Fitur pencarian atau filter jadwal berdasarkan wilayah RT/Area.
- [ ] **3.6 Halaman Informasi Pendukung (`/tentang`, `/faq`, `/kontak`, `/panduan`)**
  - [ ] Halaman Tentang Kami (latar belakang, tujuan, dan manfaat Sampura).
  - [ ] Halaman FAQ (accordion daftar pertanyaan umum masyarakat).
  - [ ] Halaman Kontak Kami & Panduan Penggunaan langkah demi langkah.

---

## Fase 4: Front-End — Dashboard Admin RW (Priority 1 & 2)
- [ ] **4.1 Autentikasi & Ringkasan Dashboard (`/admin/dashboard`)**
  - [ ] Halaman Login dengan pengecekan role `admin_rw`.
  - [ ] Kartu ringkasan statistik: Total Laporan, Menunggu Verifikasi, Ditolak, Diteruskan ke Pemerintah, Dalam Penanganan, dan Selesai.
- [ ] **4.2 Daftar Laporan Masuk (`/admin/laporan`)**
  - [ ] Tabel daftar laporan se-RW (Nomor Laporan, Judul, Kategori, RT, Tanggal, Badge Status, Tombol Detail).
  - [ ] Fitur pencarian kata kunci serta filter berdasarkan Status, Kategori, Wilayah RT, dan Rentang Tanggal.
- [ ] **4.3 Detail & Verifikasi Laporan (`/admin/laporan/:id`)**
  - [ ] Tampilan lengkap data pelapor (nama & telepon jika ada), deskripsi, alamat, titik peta Leaflet, dan galeri foto bukti.
  - [ ] **Aksi 1 — Tolak Laporan**: Tombol *Tolak* yang membuka modal wajib isi alasan penolakan (`rejection_reason`), mengubah status ke *Ditolak*, dan menyimpan ke riwayat status.
  - [ ] **Aksi 2 — Teruskan ke Pemerintah via WhatsApp**:
    - [ ] Tombol *Siapkan Pesan WhatsApp* yang memformat otomatis Nomor Laporan, Judul, Kategori, Deskripsi, Lokasi/Koordinat, dan tautan foto ke URL WhatsApp (`https://wa.me/...`).
    - [ ] Tombol *Konfirmasi Sudah Diteruskan* (hanya ditekan setelah Admin RW benar-benar mengirim pesan di WhatsApp) untuk mengubah status menjadi *Diteruskan ke Pemerintah* serta mencatat `forwarded_at` dan `forwarded_by`.
- [ ] **4.4 Pembaruan Status & Riwayat Laporan**
  - [ ] Form pembaruan status (*Dalam Penanganan* atau *Selesai*) berdasarkan konfirmasi dari pemerintah.
  - [ ] Input terpisah untuk **Keterangan Publik (`public_note`)** yang dapat dilihat warga dan **Catatan Internal (`internal_note`)** khusus dokumentasi Admin RW.
  - [ ] Tampilan log riwayat status lengkap beserta nama akun pengubah dan waktu perubahan.
- [ ] **4.5 Lihat Jadwal Pengangkutan (`/admin/jadwal`)**
  - [ ] Tampilan daftar jadwal pengangkutan (hanya baca / *read-only* untuk Admin RW sesuai PRD Bagian 5.3.3).

---

## Fase 5: Front-End — Dashboard Petugas Kebersihan (Priority 2)
- [ ] **5.1 Autentikasi & Dashboard Jadwal (`/petugas/dashboard`)**
  - [ ] Login dengan pengecekan role `petugas_kebersihan` (tanpa akses ke data laporan warga).
  - [ ] Kartu ringkasan jumlah jadwal pengangkutan yang Aktif dan Nonaktif.
- [ ] **5.2 Pengelolaan Jadwal Pengangkutan (`/petugas/jadwal`)**
  - [ ] Tabel daftar seluruh jadwal pengangkutan (Area, Hari, Jam Mulai, Jam Selesai, Keterangan, Status Aktif).
  - [ ] Form/Modal **Tambah Jadwal Baru** dan **Edit Jadwal**.
  - [ ] Tombol toggle **Aktifkan / Nonaktifkan Jadwal** (`is_active`) yang langsung memperbarui tampilan di halaman publik.

---

## Fase 6: Keamanan Lanjutan, Pengujian & Deployment (Priority 3)
- [ ] **6.1 Penguatan Keamanan & Anti-Spam**
  - [ ] Pasang proteksi CAPTCHA / Cloudflare Turnstile pada form Lapor Sampah dan form Cek Status.
  - [ ] Terapkan pembatasan frekuensi request (*rate limiting*) untuk mencegah spam laporan dan *brute-force* kode akses.
  - [ ] Kompresi ukuran gambar otomatis di sisi client sebelum diunggah ke Supabase Storage agar hemat kuota dan cepat dimuat.
- [ ] **6.2 Checklist Kriteria Penerimaan (Acceptance Criteria Testing)**
  - [ ] Masyarakat berhasil mengirim laporan tanpa login dan menerima Nomor Laporan + Kode Akses.
  - [ ] Masyarakat tidak bisa melihat laporan orang lain hanya dengan menebak Nomor Laporan tanpa Kode Akses.
  - [ ] Alasan penolakan tampil dengan jelas di halaman Cek Status ketika laporan ditolak Admin RW.
  - [ ] Catatan internal (`internal_note`) Admin RW dipastikan **tidak** bocor di halaman publik maupun di response jaringan (Network tab).
  - [ ] Penerusan WhatsApp hanya mengubah status laporan setelah Admin RW menekan konfirmasi pengiriman.
  - [ ] Admin RW tidak bisa mengubah jadwal pengangkutan, dan Petugas Kebersihan tidak bisa mengakses atau mengubah laporan masyarakat.
  - [ ] Seluruh halaman tampil rapi dan responsif di layar Smartphone, Tablet, dan Desktop.
- [ ] **6.3 Deployment Produksi**
  - [ ] Hubungkan repository GitHub ke **Vercel**.
  - [ ] Konfigurasikan Environment Variables di dashboard Vercel dan lakukan pengujian akhir pada URL produksi.