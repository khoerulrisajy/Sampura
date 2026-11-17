import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Calendar,
  MapPin,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Check,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function CekStatus() {
  const [searchParams, setSearchParams] = useSearchParams()
  const reportParamId = searchParams.get('id')

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)

  // Ambil daftar laporan dari Supabase
  const fetchReports = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          rt_areas (rt_number, area_name),
          categories (name),
          report_images (image_url)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const sampleFallback = [
        {
          id: 'sample-1',
          report_number: 'LPR-001',
          title: 'Sampah tidak diangkut selama seminggu',
          address: 'Perum. Taman Sari Blok F5 No. 4',
          status: 'Selesai',
          created_at: '2026-07-27T08:00:00Z',
          updated_at: '2026-07-28T10:00:00Z',
          description: 'Sampah di Gang saya sudah beberapa hari belum diangkut, jadi numpuk dan bau nya mengganggu aktifitas semua orang.',
          public_note: 'Telah diangkut tuntas oleh armada truk DLH Kota Batam.',
          report_images: [{ image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80' }]
        },
        {
          id: 'sample-2',
          report_number: 'LPR-002',
          title: 'Sampah anorganik saya tidak ikut diangkut dgn sampah lain',
          address: 'Perum. Taman Sari Hijau Blok C2 No. 11',
          status: 'Selesai',
          created_at: '2026-08-02T10:30:00Z',
          updated_at: '2026-08-03T11:00:00Z',
          description: 'Sampah kardus dan botol plastik dipisahkan di depan pagar tetapi tidak diangkut bersamaan.',
          public_note: 'Sudah dikoordinasikan dengan petugas pengangkut daur ulang.',
          report_images: [{ image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80' }]
        },
        {
          id: 'sample-3',
          report_number: 'LPR-003',
          title: 'Sampah organik masih tertinggal setelah jadwal pengangkutan',
          address: 'Perum. Tiban Harmoni Blok A3 No. 7',
          status: 'Dalam Penanganan',
          created_at: '2026-08-08T09:15:00Z',
          updated_at: '2026-08-09T14:20:00Z',
          description: 'Petugas kebersihan terlewat mengangkut tong sampah di deretan rumah nomor 7.',
          public_note: 'Petugas sedang dalam perjalanan pengangkutan susulan.',
          report_images: [{ image_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80' }]
        },
        {
          id: 'sample-4',
          report_number: 'LPR-004',
          title: 'Pengangkutan sampah terlewat dari jadwal',
          address: 'Perum. Tiban Palem Blok E No. 1',
          status: 'Selesai',
          created_at: '2026-08-15T14:00:00Z',
          updated_at: '2026-08-16T15:00:00Z',
          description: 'Jadwal hari Selasa siang belum ada armada truk yang masuk ke lorong blok E.',
          public_note: 'Selesai dibersihkan pada rute sore.',
          report_images: [{ image_url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80' }]
        }
      ]

      const combined = data && data.length > 0 ? [...data, ...sampleFallback] : sampleFallback
      setReports(combined)

      if (reportParamId && combined) {
        const found = combined.find((r) => r.id === reportParamId || r.report_number === reportParamId)
        if (found) setSelectedReport(found)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [reportParamId])

  // Filter laporan
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.report_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'Selesai') {
      matchesStatus = r.status === 'Selesai'
    } else if (statusFilter === 'Diproses') {
      matchesStatus = r.status === 'Dalam Penanganan' || r.status === 'Diteruskan ke Pemerintah'
    } else if (statusFilter === 'Menunggu') {
      matchesStatus = r.status === 'Menunggu Verifikasi'
    }

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString) => {
    if (!dateString) return '20/09/2026'
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  // TAMPILAN DETAIL (SESUAI PAGE 6 FIGMA)
  if (selectedReport) {
    const isSelesai = selectedReport.status === 'Selesai'
    const isDiproses =
      selectedReport.status === 'Dalam Penanganan' ||
      selectedReport.status === 'Diteruskan ke Pemerintah'

    const reportImages = selectedReport.report_images || []

    return (
      <div className="bg-[#DDF2E5]/50 min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedReport(null)
              setSearchParams({})
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#064E46] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          {/* 2-Column Detail Grid (Sesuai Page 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Card: Detail Masalah & Foto */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#C7D8CF]/70 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-3">
                {/* Photo Sampah */}
                <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={
                      reportImages[0]?.image_url ||
                      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={selectedReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="pt-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#064E46] leading-snug">
                    {selectedReport.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#55766B] pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#064E46]" />
                      <span>{selectedReport.address}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(selectedReport.created_at)}</span>
                    </span>
                  </div>

                  <div className="pt-3">
                    <span
                      className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${
                        isSelesai
                          ? 'bg-[#E0F2E9] text-[#1E7B50]'
                          : 'bg-[#FDF3E6] text-[#D97706]'
                      }`}
                    >
                      {isSelesai ? 'Selesai' : 'Diproses'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5 border-t border-[#C7D8CF]/40 pt-4">
                <h3 className="text-xs font-bold text-[#064E46]">Deskripsi</h3>
                <p className="text-xs text-[#064E46]/80 leading-relaxed font-normal">
                  {selectedReport.description}
                </p>
              </div>

              {/* Catatan Tindak Lanjut dari Admin jika ada */}
              {selectedReport.public_note && (
                <div className="bg-[#E7F6ED] border border-[#C7D8CF] p-3.5 rounded-2xl text-xs text-[#064E46] space-y-1">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-[#176B50]">
                    Pembaruan dari Pengelola:
                  </span>
                  <p className="leading-relaxed">{selectedReport.public_note}</p>
                </div>
              )}

              {/* Foto Row */}
              <div className="space-y-2 border-t border-[#C7D8CF]/40 pt-4">
                <h3 className="text-xs font-bold text-[#064E46]">Foto</h3>
                <div className="flex items-center gap-3">
                  {reportImages.slice(0, 3).map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {/* Plus placeholders (sesuai Page 6) */}
                  <div className="w-16 h-16 rounded-xl bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46]">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-[#DDF2E5]/60 flex items-center justify-center text-[#064E46]">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Status Penanganan Stepper (Sesuai Page 6) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#C7D8CF]/70 p-6 sm:p-8 space-y-8 shadow-xs">
              <h2 className="text-base font-bold text-[#064E46]">Status Penanganan</h2>

              {/* Vertical Stepper */}
              <div className="space-y-6 relative pl-8 border-l-2 border-[#C7D8CF]/60 ml-3">
                {/* Step 1: Laporan Masuk */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-0.5 w-6 h-6 rounded-full bg-[#064E46] text-white flex items-center justify-center text-xs shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#064E46]">Laporan Masuk</h4>
                    <span className="text-[10px] text-gray-400">{formatDate(selectedReport.created_at)}</span>
                  </div>
                </div>

                {/* Step 2: Dalam Proses */}
                <div className="relative">
                  <div
                    className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                      isDiproses || isSelesai
                        ? 'bg-[#064E46] text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-300'
                    }`}
                  >
                    {isDiproses || isSelesai ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#064E46]">Dalam Proses</h4>
                    <span className="text-[10px] text-gray-400">
                      {isDiproses || isSelesai ? formatDate(selectedReport.updated_at) : '-'}
                    </span>
                  </div>
                </div>

                {/* Step 3: Selesai */}
                <div className="relative">
                  <div
                    className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                      isSelesai
                        ? 'bg-[#064E46] text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-300'
                    }`}
                  >
                    {isSelesai ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#064E46]">Selesai</h4>
                    <span className="text-[10px] text-gray-400">{isSelesai ? formatDate(selectedReport.updated_at) : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Notice Card with Truck Icon (Sesuai Page 6) */}
              <div className="bg-[#DDF2E5]/70 border border-[#C7D8CF]/60 rounded-2xl p-4 flex items-start gap-3">
                <div className="text-[#064E46] mt-0.5 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-[#064E46]">Terima kasih atas laporan anda!</h5>
                  <p className="text-[11px] text-[#064E46]/80 leading-relaxed font-normal">
                    Kami akan segera menindaklanjuti laporan ini.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TAMPILAN LIST: LAPORAN SAYA (SESUAI PAGE 4 FIGMA)
  return (
    <div className="bg-[#DDF2E5]/50 min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header (Sesuai Page 4) */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E46] tracking-tight">
            Laporan Saya
          </h1>
          <p className="text-xs text-[#064E46]/75 mt-1 font-normal">
            Pantau terus laporan yang telah anda buat
          </p>
        </div>

        {/* Filter Bar (Sesuai Page 4) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari laporan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-[#C7D8CF] text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-white border border-[#C7D8CF] text-xs font-semibold text-[#064E46] focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
            >
              <option value="">Semua status</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Menunggu">Menunggu Verifikasi</option>
            </select>
          </div>
        </div>

        {/* Cards List (Sesuai Page 4) */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-[#55766B] text-xs">Memuat daftar laporan...</div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#C7D8CF] p-10 text-center space-y-2">
              <p className="text-xs text-gray-500">Belum ada laporan yang sesuai pencarian.</p>
              <Link to="/lapor" className="text-xs font-bold text-[#064E46] hover:underline">
                Buat Laporan Baru
              </Link>
            </div>
          ) : (
            filteredReports.map((r, i) => {
              const isSelesai = r.status === 'Selesai'
              const code = r.report_number || `LPR-00${i + 1}`

              return (
                <div
                  key={r.id || i}
                  onClick={() => setSelectedReport(r)}
                  className="bg-white rounded-2xl border border-[#C7D8CF]/70 p-4 sm:p-5 flex items-center justify-between gap-4 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Trash Icon Avatar (Sesuai Page 4) */}
                    <div className="w-10 h-10 rounded-xl bg-[#DDF2E5]/70 text-[#064E46] flex items-center justify-center shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#064E46] block">{code}</span>
                      <h3 className="text-xs text-gray-700 font-medium line-clamp-1">{r.title}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(r.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge with chevron > (Sesuai Page 4) */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1 rounded-full transition-transform group-hover:scale-105 ${
                        isSelesai
                          ? 'bg-[#E0F2E9] text-[#1E7B50]'
                          : 'bg-[#FDF3E6] text-[#D97706]'
                      }`}
                    >
                      <span>{isSelesai ? 'Selesai' : 'Diproses'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
