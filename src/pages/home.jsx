import React from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, Calendar, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* BEGIN: HeroSection */}
      <section className="bg-[#DDF2E5] border-b border-[#C7D8CF]/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[440px]">
            {/* Hero Text Content */}
            <div className="py-12 sm:py-16 px-6 sm:px-8 lg:pr-10 lg:pl-4 flex flex-col justify-center">
              {/* Category Pill */}
              <div className="inline-flex items-center self-start px-4 py-1 rounded-full border border-[#064E46]/30 text-[#064E46] text-xs sm:text-[13px] font-semibold mb-6 tracking-wide">
                Bersama Jaga Lingkungan
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[41px] font-bold tracking-tight text-[#064E46] leading-[1.2] mb-5">
                Laporan Sampah<br />
                Lebih Mudah,<br />
                Lingkungan Lebih Bersih
              </h1>

              {/* Paragraph */}
              <p className="text-sm sm:text-base text-[#064E46]/80 leading-relaxed max-w-lg mb-8 font-normal">
                Sampura hadir untuk memudahkan masyarakat dalam melaporkan sampah dan memantau proses penanganannya secara transparan dan terkoordinasi
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/lapor"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#064E46] text-white font-medium text-sm hover:bg-[#0B594E] transition-all shadow-sm focus:outline-hidden"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Lapor Sampah</span>
                </Link>
                <Link
                  to="/panduan"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-[#064E46]/35 bg-[#BFE0CE]/40 hover:bg-[#BFE0CE]/70 text-[#064E46] font-medium text-sm transition-all focus:outline-hidden"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-full min-h-[300px] lg:min-h-full overflow-hidden">
              <img
                alt="Taman kota hijau yang bersih dan asri dengan tempat sampah dan pemandangan gedung bertingkat"
                className="w-full h-full object-cover object-center"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzAGI4BsbHcZ_Qf0KtURvAKmSqkhs--amdxfihjC5EnarvqAcZAP1kHbHZcXuhdSloC1bXBa1kYAPXc6L4GVrqZT1Nptz3S1SGjiBv2JCQkLUwA3mzxWJf-KrUMf7ZFcn10vsmMIld-avTMXy2EP0ckBM_es9012e0r8fQYwIQ7XrLF66Lnpj83b3N7Mr4v7xnYKvcESyAqfbWYaRa1m-COSjysE2SVuubTJMExf5jXMwQzFODmM-vbg"
              />
            </div>
          </div>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: BenefitsSection */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#C7D8CF]/40 shadow-xs">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#C7D8CF]/60">
            {/* Value 1: Mudah */}
            <div className="flex flex-col items-center text-center px-6 py-4 md:py-2">
              <div className="w-12 h-12 rounded-full bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46] mb-3.5">
                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#064E46] tracking-wide mb-1">Mudah</h3>
              <p className="text-xs text-[#55766B] leading-relaxed font-normal">
                Melapor dengan<br className="hidden sm:inline" /> Cepat dan Sederhana
              </p>
            </div>

            {/* Value 2: Transparan */}
            <div className="flex flex-col items-center text-center px-6 py-4 md:py-2">
              <div className="w-12 h-12 rounded-full bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46] mb-3.5">
                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#064E46] tracking-wide mb-1">Transparan</h3>
              <p className="text-xs text-[#55766B] leading-relaxed font-normal">
                Pantau perkembangan<br className="hidden sm:inline" /> laporan anda
              </p>
            </div>

            {/* Value 3: Terkoordinasi */}
            <div className="flex flex-col items-center text-center px-6 py-4 md:py-2">
              <div className="w-12 h-12 rounded-full bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46] mb-3.5">
                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.001M15 11.25a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 00-3.214-2.046M6 18.72a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72m-.94 3.198l-.001.001M9 11.25a3 3 0 10-6 0 3 3 0 006 0zm-3 3a2.25 2.25 0 013.214-2.046m0 0a5.97 5.97 0 013.786-1.326m-3.786 1.326a5.97 5.97 0 00-3.786-1.326"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#064E46] tracking-wide mb-1">Terkoordinasi</h3>
              <p className="text-xs text-[#55766B] leading-relaxed font-normal">
                Bersama pengelola untuk<br className="hidden sm:inline" /> lingkungan yang lebih baik
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* END: BenefitsSection */}

      {/* BEGIN: HowItWorksSection */}
      <section className="bg-[#DDF2E5]/70 py-16 px-4 sm:px-6 lg:px-8" id="panduan">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#064E46]/30 text-[#064E46] text-xs sm:text-[13px] font-semibold mb-4 tracking-wide">
              Panduan Penggunaan
            </div>
            <h2 className="text-3xl font-extrabold text-[#064E46] tracking-tight mb-3">
              Cara Menggunakan Sampura
            </h2>
            <p className="text-[#064E46]/80 text-sm leading-relaxed font-medium">
              Ikuti langkah-langkah berikut untuk melaporkan sampah dengan mudah dan membantu menjaga lingkungan Kota Batam tetap bersih.
            </p>
          </div>

          {/* 3 Process Steps Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Card 01: Buat Laporan */}
            <div className="bg-white rounded-2xl border border-[#C7D8CF]/60 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#71A594] text-white text-xs font-bold">
                    01
                  </span>
                  <h3 className="text-base font-bold text-[#064E46]">Buat Laporan</h3>
                </div>
                <h4 className="text-xs font-bold text-[#064E46] mb-2">Isi Formulir Laporan</h4>
                <p className="text-xs text-[#064E46]/75 leading-relaxed font-normal mb-6">
                  Pilih jenis masalah, tentukan lokasi, tulis deskripsi, dan unggah foto jika ada. Pastikan informasi yang kamu berikan sudah lengkap dan jelas.
                </p>
              </div>

              {/* Mini Mockup UI 1 */}
              <div className="bg-[#F8FAF9] border border-[#C7D8CF]/50 rounded-xl p-3.5 space-y-2.5">
                <div className="bg-white border border-[#C7D8CF]/70 rounded-full py-1.5 px-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-gray-400"></span>
                  <span className="text-[10px] text-gray-500 font-medium">Pilih kategori sampah</span>
                </div>
                <div className="border border-dashed border-[#C7D8CF]/80 rounded-lg py-3 flex flex-col items-center justify-center bg-white/70">
                  <svg className="w-4 h-4 text-gray-400 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    ></path>
                    <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                  </svg>
                  <span className="text-[9px] text-gray-400">Unggah foto pendukung</span>
                </div>
                <Link
                  to="/lapor"
                  className="w-full bg-[#064E46] hover:bg-[#0B594E] text-white rounded-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] font-medium shadow-xs transition-colors"
                >
                  <svg className="w-3 h-3 rotate-45 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <span>Kirim Laporan</span>
                </Link>
              </div>
            </div>

            {/* Card 02: Pantau Laporan */}
            <div className="bg-white rounded-2xl border border-[#C7D8CF]/60 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#71A594] text-white text-xs font-bold">
                    02
                  </span>
                  <h3 className="text-base font-bold text-[#064E46]">Pantau Laporan</h3>
                </div>
                <h4 className="text-xs font-bold text-[#064E46] mb-2">Cek Perkembangan Laporan</h4>
                <p className="text-xs text-[#064E46]/75 leading-relaxed font-normal mb-6">
                  Setelah laporan terkirim, kamu akan mendapatkan nomor laporan. Simpan dan gunakan nomor tersebut untuk memantau perkembangan penanganan sampah melalui halaman Cek Status.
                </p>
              </div>

              {/* Mini Mockup UI 2 */}
              <div className="bg-[#F8FAF9] border border-[#C7D8CF]/50 rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[126px]">
                <span className="text-[11px] font-bold text-[#064E46] mb-2">No. Laporan</span>
                <Link
                  to="/cek-status"
                  className="px-4 py-1 bg-[#6FB493] hover:bg-[#5a9c7c] text-white font-bold text-xs rounded-full mb-3 shadow-xs transition-colors"
                >
                  SMP-20261114-3674
                </Link>
                <p className="text-[9px] text-gray-500 leading-normal max-w-[200px]">
                  Anda dapat memantau status laporan melalui menu{' '}
                  <span className="font-semibold text-[#064E46]">Cek Status</span>.
                </p>
              </div>
            </div>

            {/* Card 03: Tindak Lanjut */}
            <div className="bg-white rounded-2xl border border-[#C7D8CF]/60 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#71A594] text-white text-xs font-bold">
                    03
                  </span>
                  <h3 className="text-base font-bold text-[#064E46]">Tindak Lanjut</h3>
                </div>
                <h4 className="text-xs font-bold text-[#064E46] mb-2">Lihat Status & Perkembangan</h4>
                <p className="text-xs text-[#064E46]/75 leading-relaxed font-normal mb-6">
                  Dapatkan informasi terbaru mengenai proses pengangkutan sampah hingga laporan selesai ditangani oleh dinas terkait.
                </p>
              </div>

              {/* Mini Mockup UI 3 */}
              <div className="bg-[#F8FAF9] border border-[#C7D8CF]/50 rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[126px]">
                <div className="w-8 h-8 rounded-full bg-[#064E46] text-white flex items-center justify-center mb-2 shadow-xs">
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-[#064E46] mb-1">Laporan Selesai</span>
                <p className="text-[9px] text-gray-500 leading-normal max-w-[190px]">
                  Terima kasih telah berpartisipasi dalam menjaga kebersihan Kota Batam.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Schedule Notice Banner */}
          <div className="mt-12 bg-white rounded-2xl border border-[#C7D8CF]/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#176B50]">
                Jadwal Pengangkutan Rutin
              </span>
              <h3 className="text-xl font-bold text-[#064E46]">
                Ketahui Jam dan Hari Armada Truk Sampah di RT Anda
              </h3>
              <p className="text-xs text-[#55766B] max-w-xl">
                Cek jadwal operasional petugas kebersihan agar sampah rumah tangga dapat diangkut tepat waktu.
              </p>
            </div>
            <Link
              to="/jadwal"
              className="shrink-0 inline-flex items-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Lihat Jadwal RT</span>
            </Link>
          </div>
        </div>
      </section>
      {/* END: HowItWorksSection */}
    </div>
  )
}
