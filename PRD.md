PRODUCT REQUIREMENTS DOCUMENT (PRD)
Nama Produk: Sampura — Platform Pengaduan dan Informasi Pengangkutan Sampah
Versi Dokumen: 1.5 (Final Tersinkronisasi Riset, UI/UX & ERD)
Cakupan Wilayah: Satu RW yang terdiri dari beberapa RT di wilayah perkotaan Batam
Platform: Website Responsif (Desktop, Tablet, Smartphone)   
Adinata (1).pdf
+ 4
1. Ikhtisar Produk (Product Overview)
Deskripsi Produk: Sampura adalah platform berbasis web yang memfasilitasi masyarakat untuk melaporkan masalah sampah, melihat informasi jadwal pengangkutan, dan memantau perkembangan penanganan laporan secara transparan.   
Adinata (1).pdf
+ 1
Peran Penghubung: Platform ini menghubungkan masyarakat, Admin RW, Petugas Kebersihan, dan pihak pemerintah dalam satu alur pengelolaan pengaduan sampah yang terstruktur.   
Adinata (1).pdf
+ 2
Pernyataan Produk (Product Statement): Sampura hadir untuk memudahkan masyarakat dalam melaporkan sampah serta memantau proses penanganannya secara mudah, transparan, dan terkoordinasi.   
Adinata (1).pdf
+ 2
Tujuan Utama: Mempermudah pelaporan warga, menyediakan jadwal pengangkutan sampah, membantu Admin RW memverifikasi serta meneruskan laporan ke pemerintah, dan menyajikan transparansi status tindak lanjut.   
Adinata (1).pdf
+ 1
2. Latar Belakang Masalah (Problem Statement)
Masalah Masyarakat: Warga mengalami penumpukan sampah dan keterlambatan pengangkutan (mayoritas 2–3 hari), tidak mengetahui jadwal pengangkutan (66,7%), bingung harus melapor ke mana (66,7%), serta kesulitan memantau tindak lanjut laporan.   
Adinata (1).pdf
+ 4
Masalah Pengelola: Pihak pengelola kesulitan mendokumentasikan laporan dari berbagai saluran komunikasi yang tidak terstruktur serta membutuhkan sistem untuk memverifikasi dan menentukan prioritas penanganan.   
Adinata (1).pdf
+ 2
3. Target Pengguna & Pembagian Peran (Target Users)
Masyarakat (Pengguna Publik Tanpa Login): Warga yang mengakses website untuk melihat jadwal pengangkutan, mengirim pengaduan sampah, menerima nomor laporan beserta kode akses rahasia, dan melacak status penanganan laporan.   
Sampura Database dan ERD.pdf
+ 2
Admin RW (Role admin_rw): Pengelola tingkat RW yang bertugas memverifikasi laporan warga dari beberapa RT, menolak laporan tidak valid beserta alasan, meneruskan laporan valid ke pemerintah via WhatsApp, dan memperbarui status penanganan.   
Sampura Database dan ERD.pdf
+ 3
Petugas Kebersihan (Role petugas_kebersihan): Pihak operasional yang memiliki akses khusus ke dashboard jadwal untuk menambah, mengubah, serta mengaktifkan atau menonaktifkan jadwal pengangkutan sampah.   
Sampura Database dan ERD.pdf
+ 1
4. Cakupan Pengembangan (Product Scope)
Fitur yang Dikembangkan (In-Scope)
Website Publik: Meliputi halaman Beranda, Lapor Sampah, Konfirmasi Laporan, Jadwal Pengangkutan Sampah, Cek Status Laporan (termasuk Laporan Saya & Detail Status), Tentang Kami, FAQ, Kontak Kami, dan Panduan Penggunaan.   
Adinata (1).pdf
+ 2
Dashboard Admin RW: Mencakup halaman Login Admin RW, Dashboard Ringkasan, Daftar Laporan dengan pencarian/filter, Detail Laporan, Verifikasi & Penolakan Laporan, Penerusan ke Pemerintah via WhatsApp, serta Pembaruan & Riwayat Status.   
Sampura Database dan ERD.pdf
+ 3
Dashboard Petugas Kebersihan: Mencakup halaman Login Petugas Kebersihan, Dashboard Ringkasan Jadwal, Daftar Jadwal Pengangkutan, Form Tambah/Edit Jadwal, dan Pengaturan Status Aktif/Nonaktif Jadwal.   
Sampura Database dan ERD.pdf
+ 1
Sistem Pendukung: Meliputi database PostgreSQL, penyimpanan foto laporan, generator nomor laporan otomatis, enkripsi hash kode akses rahasia, autentikasi berbasis role, log riwayat status, dan validasi keamanan data.   
Sampura Database dan ERD.pdf
+ 2
Fitur di Luar Cakupan Awal (Out-of-Scope)
Pengembangan Lanjutan yang Ditangguhkan: Aplikasi mobile native, registrasi/login warga, penugasan otomatis petugas, dashboard khusus pemerintah, integrasi API pemerintah, kirim WhatsApp otomatis tanpa aksi Admin RW, GPS pelacakan truk sampah, dan fitur pembayaran.   
Sampura Database dan ERD.pdf
5. Kebutuhan Fungsional (Functional Requirements)
5.1 Website Publik
Beranda: Menampilkan identitas Sampura, menu navigasi utama, hero section bertagline "BERSAMA JAGA LINGKUNGAN", ringkasan cara kerja, tombol CTA "Lapor Sampah", akses ke jadwal pengangkutan, dan footer kontak.   
Adinata (1).pdf
+ 2
Formulir Lapor Sampah: Masyarakat dapat mengirim laporan tanpa login dengan pengisian data terstruktur yang divalidasi oleh sistem.   
Sampura Database dan ERD.pdf
Nama Field	Tipe Input	Ketentuan Validasi	Keterangan Fungsi
Nama Pelapor	Teks	Opsional	Identitas pelapor untuk dilihat Admin RW
Nomor Telepon	Teks / Angka	Opsional	Kontak pelapor jika butuh konfirmasi
Wilayah RT	Dropdown	Wajib	Memilih RT lokasi dari daftar RT di RW
Kategori Sampah	Dropdown	Wajib	Memilih kategori masalah sampah yang aktif
Judul Laporan	Teks	Wajib	Ringkasan masalah sampah yang dilaporkan
Deskripsi	Textarea	Wajib	Penjelasan detail kondisi permasalahan sampah
Alamat Lokasi	Teks	Wajib	Detail patokan alamat lokasi sampah
Titik Koordinat	Peta Interaktif	Wajib	Titik lintang dan bujur melalui peta Leaflet
Foto Bukti	Upload File	Opsional (Maks 5)	Unggah maksimal 5 foto bukti kondisi sampah
Tabel di atas menyelaraskan ketentuan input formulir di PRD dengan struktur relasi wilayah RT (rt_id) dan kategori (category_id) pada ERD.   
Sampura Database dan ERD.pdf
+ 3
Konfirmasi Laporan: Menampilkan notifikasi berhasil, Nomor Laporan unik, dan Kode Akses Rahasia yang hanya dimunculkan satu kali beserta instruksi penyimpanan dan tombol menuju Cek Status.   
Adinata (1).pdf
+ 3
Jadwal Pengangkutan Sampah: Menampilkan daftar jadwal pengangkutan yang berstatus aktif meliputi wilayah/area RT, hari, jam mulai hingga selesai, dan keterangan tambahan.   
Sampura Database dan ERD.pdf
+ 1
Cek Status & Detail Laporan (Laporan Saya): Pengguna memasukkan Nomor Laporan dan Kode Akses Rahasia untuk melihat detail pengaduan, status terkini, alasan penolakan (jika ditolak), serta timeline riwayat status beserta catatan publik tanpa mengekspos catatan internal.   
Sampura Database dan ERD.pdf
+ 2
Halaman Informasi Pendukung: Menyediakan halaman Tentang Kami, FAQ, Kontak Kami, dan Panduan Penggunaan untuk edukasi warga.   
Adinata (1).pdf
+ 2
5.2 Dashboard Admin RW
Autentikasi & Ringkasan Dashboard: Hanya akun ber-role admin_rw yang dapat login untuk melihat kartu ringkasan total laporan, menunggu verifikasi, ditolak, diteruskan ke pemerintah, dalam penanganan, dan selesai.   
Sampura Database dan ERD.pdf
+ 1
Daftar & Detail Laporan: Menampilkan tabel laporan se-RW dengan fitur pencarian dan filter (berdasarkan status, kategori, tanggal, atau RT), serta halaman detail yang memuat identitas pelapor, foto, peta lokasi, dan riwayat status.   
Sampura Database dan ERD.pdf
+ 2
Verifikasi & Penolakan Laporan: Admin RW memeriksa validitas laporan; jika ditolak, Admin RW wajib mengisi alasan penolakan yang nantinya tampil di halaman Cek Status pelapor.   
Sampura Database dan ERD.pdf
+ 1
Penerusan Laporan via WhatsApp: Jika valid, tombol penerusan akan menyiapkan draf pesan WhatsApp berisi nomor laporan, judul, kategori, deskripsi, lokasi, dan tautan foto. Status baru berubah menjadi Diteruskan ke Pemerintah setelah pesan dikirim di WhatsApp dan Admin RW menekan konfirmasi di dashboard.   
Sampura Database dan ERD.pdf
+ 3
Pembaruan & Riwayat Status: Admin RW memperbarui status laporan menjadi Dalam Penanganan atau Selesai berdasarkan informasi resmi dari pemerintah, serta menambahkan keterangan publik dan catatan internal yang tercatat otomatis di riwayat status.   
Sampura Database dan ERD.pdf
+ 3
5.3 Dashboard Petugas Kebersihan
Autentikasi & Pengelolaan Jadwal: Hanya akun ber-role petugas_kebersihan yang dapat login untuk melihat ringkasan jadwal, menambah jadwal baru, mengubah hari/jam/area/keterangan, serta mengaktifkan atau menonaktifkan jadwal.   
Sampura Database dan ERD.pdf
+ 1
6. Manajemen Status Laporan (Report Status Management)
Nama Status	Pihak Pengubah	Penjelasan Kondisi Status	Visibilitas Catatan
Menunggu Verifikasi	Sistem Otomatis	Laporan baru berhasil dikirim dan menunggu pemeriksaan	Publik
Ditolak	Admin RW	Laporan tidak valid disertai alasan penolakan wajib	Publik (Alasan Penolakan)
Diteruskan ke Pemerintah	Admin RW	Laporan valid telah dikirim ke pemerintah via WhatsApp	Publik & Internal
Dalam Penanganan	Admin RW	Pemerintah mengonfirmasi laporan sedang ditangani	Publik & Internal
Selesai	Admin RW	Pemerintah mengonfirmasi masalah sampah telah selesai	Publik & Internal
Tabel manajemen status di atas mengatur siklus hidup laporan dari awal pengiriman hingga selesai beserta batasan akses informasinya.   
Sampura Database dan ERD.pdf
+ 2
7. Kebutuhan UI/UX & Design System
Palet Warna Resmi: Menggunakan Hijau Tua (#2C6705) sebagai warna primer, Hijau Muda (#6BA24B) sebagai warna sekunder, Cream (#F8F9F4) sebagai latar belakang, dan Abu Gelap (#2E2E2E) untuk teks utama.   
Adinata (1).pdf
+ 1
Tipografi & Tata Letak: Menggunakan keluarga font Poppins (SemiBold untuk Heading, Medium untuk Subheading, Regular untuk Body Text) dengan jarak antar elemen konsisten (24 px) serta ilustrasi bertema lingkungan.   
Adinata (1).pdf
+ 1
Komponen Antarmuka: Mencakup Navbar, Hero Section, Button CTA, Form Input, Dropdown Kategori & RT, Textarea Deskripsi, Upload Foto, Peta Lokasi Leaflet, Tabel Laporan, Badge Status, Timeline Status, Modal Konfirmasi, Toast Notifikasi, dan Pagination.   
Adinata (1).pdf
+ 2
8. Skema Database & ERD (PostgreSQL Supabase)
Sistem menggunakan 8 tabel relasional di PostgreSQL Supabase yang menyatukan spesifikasi PRD dan diagram ERD:   
Sampura Database dan ERD.pdf
+ 1
Nama Tabel	Primary Key	Foreign Key Utama	Fungsi Penyimpanan Data
profiles	id (UUID)	Relasi ke auth.users	Menyimpan nama lengkap dan role akun internal (admin_rw atau petugas_kebersihan)
rt_areas	id (UUID)	-	Menyimpan daftar nomor RT, nomor RW, dan nama area cakupan
categories	id (UUID)	-	Menyimpan daftar nama kategori masalah sampah, deskripsi, dan status aktif
reports	id (UUID)	rt_id, category_id, forwarded_by	Menyimpan data utama laporan, koordinat lokasi, status, dan waktu penerusan
report_images	id (UUID)	report_id	Menyimpan URL file bukti foto laporan di Supabase Storage (maksimal 5 foto)
report_access_tokens	id (UUID)	report_id	Menyimpan token_hash dari kode akses rahasia laporan untuk verifikasi publik
report_status_history	id (UUID)	report_id, changed_by	Menyimpan log perubahan status lama ke baru, catatan publik, dan catatan internal
collection_schedules	id (UUID)	updated_by	Menyimpan jadwal pengangkutan sampah (area, hari, jam mulai/selesai, status aktif)
Rincian atribut lengkap pada setiap tabel mengikuti skema tipe data UUID, TEXT, NUMERIC, TIME, BOOLEAN, dan TIMESTAMPTZ sebagaimana tertera pada rancangan ERD.   
Sampura Database dan ERD.pdf
+ 4
9. Keamanan, Privasi Data & Kebutuhan Non-Fungsional
Kontrol Akses & RLS: Menerapkan Row Level Security (RLS) pada seluruh tabel sehingga masyarakat publik tidak dapat membaca isi tabel laporan atau token secara langsung tanpa melewati fungsi server (Supabase Edge Function / RPC).   
Sampura Database dan ERD.pdf
+ 1
Enkripsi & Proteksi Spam: Menyimpan kode akses dalam bentuk hash, menyembunyikan catatan internal dari publik, mengamankan secret key di sisi server, serta memasang CAPTCHA/Cloudflare Turnstile dan rate limiting pada endpoint publik.   
Sampura Database dan ERD.pdf
+ 2
Performa, Keandalan & Responsivitas: Mengoptimalkan ukuran unggahan gambar dan efisiensi query database, memastikan setiap transaksi status tercatat di riwayat, serta menjamin tampilan responsif di perangkat desktop, tablet, dan smartphone.   
Sampura Database dan ERD.pdf
+ 1
10. Teknologi yang Digunakan (Technology Stack)
Frontend & Styling: React.js dengan build tool Vite, Tailwind CSS untuk styling, React Router DOM untuk navigasi halaman, dan Lucide React untuk ikonografi.   
Sampura Database dan ERD.pdf
+ 1
Peta Digital: Leaflet.js yang dipadukan dengan data peta OpenStreetMap untuk pemilihan dan penandaan titik koordinat lokasi sampah.   
Sampura Database dan ERD.pdf
Backend & Infrastruktur: Supabase (PostgreSQL Database, Supabase Auth, Supabase Storage, Supabase Edge Functions / RPC), Git & GitHub untuk manajemen kode sumber, serta Vercel untuk deployment.   
Sampura Database dan ERD.pdf
+ 1
11. Prioritas Pengembangan & Kriteria Penerimaan (Acceptance Criteria)
Priority 1 (Core Features): Pembuatan skema database, website publik, form Lapor Sampah, penyimpanan laporan, generator nomor laporan & kode akses, login & dashboard Admin RW, verifikasi/penolakan, penerusan WhatsApp, dan Cek Status.   
Sampura Database dan ERD.pdf
+ 1
Priority 2 (Supporting Features): Riwayat status laporan, pembaruan status lanjutan oleh Admin RW, upload multi-foto ke Supabase Storage, integrasi peta lokasi Leaflet, halaman Jadwal Pengangkutan, serta dashboard & CRUD Petugas Kebersihan.   
Sampura Database dan ERD.pdf
Priority 3 (Improvements): Penyempurnaan responsivitas antarmuka, penguatan keamanan (rate limiting & Turnstile), optimasi performa, kelengkapan konten FAQ/panduan, dan pengujian pengguna menyeluruh.   
Sampura Database dan ERD.pdf
+ 1
Kriteria Penerimaan Utama: Masyarakat berhasil melapor tanpa login dan melacak status dengan kode akses, Admin RW berhasil memverifikasi/menolak/meneruskan laporan via WhatsApp serta memperbarui status, dan Petugas Kebersihan berhasil mengelola jadwal aktif.