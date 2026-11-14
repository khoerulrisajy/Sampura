import React from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, BookOpen, Users, Phone, ShieldCheck, Mail, MapPin } from 'lucide-react'

export function Panduan() {
  const guides = [
    {
      step: '1. Mengisi Formulir Pengaduan',
      desc: 'Buka halaman Lapor Sampah. Pilih wilayah RT lokasi Anda dan kategori permasalahan sampah. Tulis judul dan deskripsi masalah secara jelas.',
    },
    {
      step: '2. Menentukan Titik Peta & Foto Bukti',
      desc: 'Gunakan peta interaktif untuk menandai lokasi tumpukan sampah secara presisi. Unggah hingga 5 foto bukti kondisi sampah di lapangan.',
    },
    {
      step: '3. Menyimpan Nomor Laporan & Kode Akses',
      desc: 'Setelah mengirim laporan, sistem akan memberikan Nomor Laporan dan Kode Akses Rahasia. Simpan atau salin kode ini dengan baik.',
    },
    {
      step: '4. Memeriksa Perkembangan Laporan',
      desc: 'Buka menu Cek Status Laporan, masukkan Nomor Laporan dan Kode Akses Anda untuk melihat tindak lanjut yang dilakukan oleh Admin RW dan dinas kebersihan.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#2E2E2E]">Panduan Penggunaan Sampura</h1>
        <p className="text-gray-600 mt-2">Langkah mudah melaporkan dan memantau masalah sampah di lingkungan Anda</p>
      </div>

      <div className="space-y-6">
        {guides.map((g, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#064E46] text-white flex items-center justify-center font-bold text-lg shrink-0">
              {i + 1}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{g.step}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/lapor"
          className="inline-flex items-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white px-6 py-3 rounded-xl font-medium text-sm shadow-md transition-all"
        >
          <span>Mulai Buat Pengaduan Sekarang</span>
        </Link>
      </div>
    </div>
  )
}

export function FAQ() {
  const faqs = [
    {
      q: 'Apakah saya harus mendaftar atau login untuk melapor?',
      a: 'Tidak. Masyarakat umum dapat membuat laporan secara langsung tanpa perlu membuat akun atau login.',
    },
    {
      q: 'Mengapa saya mendapatkan Kode Akses Rahasia?',
      a: 'Kode Akses Rahasia berfungsi sebagai kunci keamanan unik agar hanya Anda yang dapat melihat detail laporan dan riwayat status pengaduan Anda.',
    },
    {
      q: 'Berapa lama laporan saya akan diproses?',
      a: 'Admin RW memverifikasi laporan baru dalam waktu maksimal 1x24 jam sebelum diteruskan ke dinas pengangkutan sampah pemerintah.',
    },
    {
      q: 'Bagaimana jika laporan saya ditolak?',
      a: 'Jika laporan ditolak (misalnya karena lokasi di luar RW atau informasi tidak lengkap), Admin RW akan mencantumkan alasan penolakan secara jelas yang dapat Anda baca di menu Cek Status.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#2E2E2E]">Pertanyaan yang Sering Diajukan (FAQ)</h1>
        <p className="text-gray-600 mt-2">Jawaban seputar cara kerja dan alur pelaporan sampah di Sampura</p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="font-bold text-gray-900 text-base mb-2 flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-[#064E46] shrink-0 mt-0.5" />
              <span>{f.q}</span>
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed pl-7">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Tentang() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#2E2E2E]">Tentang Sampura</h1>
        <p className="text-gray-600 mt-2">Inisiatif digital untuk lingkungan bersih dan sehat di Kota Batam</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
        <p>
          <strong>Sampura</strong> adalah platform digital pengelolaan pengaduan dan keterbukaan informasi sampah yang dirancang khusus untuk menghubungkan masyarakat di tingkat rukun warga (RW), pengurus RW, petugas kebersihan, serta dinas terkait di Kota Batam.
        </p>
        <p>
          Berdasarkan hasil survei lingkungan, mayoritas warga menghadapi kendala berupa ketidaktahuan jadwal pengangkutan rutin dan kebingungan saluran pelaporan sampah yang menumpuk. Sampura hadir sebagai solusi satu pintu yang mudah digunakan dan transparan.
        </p>
        <div className="bg-[#F8F9F4] p-5 rounded-xl border border-gray-200 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#064E46] shrink-0" />
          <p className="text-sm text-gray-700 font-medium">
            Komitmen kami: Menjaga lingkungan tempat tinggal tetap bersih, asri, dan terbebas dari penumpukan sampah liar.
          </p>
        </div>
      </div>
    </div>
  )
}

export function Kontak() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#2E2E2E]">Kontak Pengurus RW</h1>
        <p className="text-gray-600 mt-2">Hubungi sekretariat RW 05 Batam Nirwana untuk kebutuhan koordinasi mendesak</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#064E46]/10 text-[#064E46] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Alamat Sekretariat</h4>
            <p className="text-sm text-gray-600 mt-1">Balai Warga RW 05, Perumahan Batam Nirwana, Kota Batam, Kepulauan Riau</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#064E46]/10 text-[#064E46] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">WhatsApp Admin RW</h4>
            <p className="text-sm text-gray-600 mt-1">+62 812-XXXX-XXXX (Pelayanan jam kerja 08:00 - 17:00 WIB)</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#064E46]/10 text-[#064E46] flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Email Resmi</h4>
            <p className="text-sm text-gray-600 mt-1">rw05.batamnirwana@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
