import React, { useState } from 'react'
import { Star, Eye, Heart, Calendar } from 'lucide-react'

export default function Tentang() {
  const [selectedPerumahan, setSelectedPerumahan] = useState('')

  // Data Jadwal Sesuai Tabel Page 5 Figma
  const jadwalData = [
    { hari: 'Senin', perumahan: 'Taman Sari Hijau', waktu: '07.00 - 11.00' },
    { hari: 'Senin', perumahan: 'Taman Sari', waktu: '13.00 - 17.00' },
    { hari: 'Selasa', perumahan: 'Tiban Harmoni', waktu: '07.00 - 11.00' },
    { hari: 'Selasa', perumahan: 'Tiban Palem', waktu: '13.00 - 17.00' },
    { hari: 'Rabu', perumahan: 'Tiban Housing', waktu: '07.00 - 11.00' },
    { hari: 'Rabu', perumahan: 'New Tiban Housing', waktu: '13.00 - 17.00' },
    { hari: 'Kamis', perumahan: 'Villa Alam Lestari', waktu: '07.00 - 11.00' },
    { hari: 'Kamis', perumahan: 'Delta Villa', waktu: '13.00 - 17.00' },
    { hari: 'Jumat', perumahan: 'Mutiara View', waktu: '07.00 - 11.00' },
    { hari: 'Jumat', perumahan: 'Tiban Impian', waktu: '13.00 - 17.00' },
    { hari: 'Sabtu', perumahan: 'Glory Royal Residence', waktu: '07.00 - 11.00' },
    { hari: 'Sabtu', perumahan: 'Tiban Bukit Asri', waktu: '13.00 - 17.00' },
  ]

  const filteredJadwal = selectedPerumahan
    ? jadwalData.filter((j) => j.perumahan.toLowerCase().includes(selectedPerumahan.toLowerCase()))
    : jadwalData

  return (
    <div className="flex flex-col">
      {/* 1. HERO TENTANG KAMI (Sesuai Page 5 Top) */}
      <section className="bg-[#DDF2E5] border-b border-[#C7D8CF]/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[400px]">
            {/* Left Content */}
            <div className="py-12 sm:py-16 px-6 sm:px-8 lg:pr-10 lg:pl-4 flex flex-col justify-center">
              <div className="inline-flex items-center self-start px-4 py-1 rounded-full border border-[#064E46]/30 text-[#064E46] text-xs sm:text-[13px] font-semibold mb-6 tracking-wide">
                Bersama Jaga Lingkungan
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[41px] font-bold tracking-tight text-[#064E46] leading-[1.2] mb-5">
                Tentang Kami
              </h1>

              <p className="text-xs sm:text-sm text-[#064E46]/80 leading-relaxed max-w-lg mb-8 font-normal">
                Sampura adalah platform pelaporan sampah berbasis web yang hadir untuk memudahkan masyarakat dalam melaporkan masalah sampah di lingkungan sekitar. Kami percaya bahwa perubahan besar di mulai dari langkah kecil, dan setiap laporan Anda berarti untuk lingkungan yang lebih bersih dan sehat.
              </p>

              <div>
                <a
                  href="#jadwal-section"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-[#064E46]/35 bg-[#BFE0CE]/40 hover:bg-[#BFE0CE]/70 text-[#064E46] font-medium text-sm transition-all"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative w-full min-h-[280px] lg:min-h-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80"
                alt="Petugas kebersihan Kota Batam"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 3 PILAR: MISI, VISI, NILAI (Sesuai Page 5 Middle) */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#C7D8CF]/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#C7D8CF]/60">
          {/* Misi */}
          <div className="flex flex-col items-center text-center px-6 py-4 md:py-2">
            <div className="w-12 h-12 rounded-full bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46] mb-3">
              <Star className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-base font-bold text-[#064E46] tracking-wide mb-1">Misi</h3>
            <p className="text-xs text-[#55766B] leading-relaxed font-normal">
              Mewujudkan lingkungan yang<br className="hidden sm:inline" /> bersih, sehat dan berkelanjutan
            </p>
          </div>

          {/* Visi */}
          <div className="flex flex-col items-center text-center px-6 py-4 md:py-2">
            <div className="w-12 h-12 rounded-full bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46] mb-3">
              <Eye className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-base font-bold text-[#064E46] tracking-wide mb-1">Visi</h3>
            <p className="text-xs text-[#55766B] leading-relaxed font-normal">
              Menjadi platform pelaporan<br className="hidden sm:inline" /> sampah terdepan di Indonesia
            </p>
          </div>

          {/* Nilai */}
          <div className="flex flex-col items-center text-center px-6 py-4 md:py-2">
            <div className="w-12 h-12 rounded-full bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46] mb-3">
              <Heart className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-base font-bold text-[#064E46] tracking-wide mb-1">Nilai</h3>
            <p className="text-xs text-[#55766B] leading-relaxed font-normal">
              Mudah, transparan dan<br className="hidden sm:inline" /> terkoordinasi
            </p>
          </div>
        </div>
      </section>

      {/* 3. JADWAL PENGANGKUTAN SAMPAH TABLE (Sesuai Page 5 Bottom) */}
      <section className="bg-[#DDF2E5]/60 py-16 px-4 sm:px-6 lg:px-8" id="jadwal-section">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-[#064E46]">
            <Calendar className="w-5 h-5" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Jadwal Pengangkutan Sampah
            </h2>
          </div>

          {/* Filter Dropdown */}
          <div className="max-w-md">
            <label className="block text-[11px] font-semibold text-[#064E46] mb-1">
              Pilih Perumahan
            </label>
            <select
              value={selectedPerumahan}
              onChange={(e) => setSelectedPerumahan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C7D8CF] text-xs text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
            >
              <option value="">Pilih Perumahan</option>
              {Array.from(new Set(jadwalData.map((j) => j.perumahan))).map((p, i) => (
                <option key={i} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-[#C7D8CF]/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#E7F6ED] border-b border-[#C7D8CF] text-[#064E46] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-6 w-1/4">Hari</th>
                  <th className="py-3 px-6 w-1/2">Perumahan</th>
                  <th className="py-3 px-6 w-1/4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C7D8CF]/40 text-gray-800 font-medium">
                {filteredJadwal.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F5F9F7] transition-colors">
                    <td className="py-3.5 px-6 font-bold text-[#064E46]">{item.hari}</td>
                    <td className="py-3.5 px-6">{item.perumahan}</td>
                    <td className="py-3.5 px-6 font-mono text-[#55766B]">{item.waktu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
