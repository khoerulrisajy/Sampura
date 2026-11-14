import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  Search,
  KeyRound,
  FileText,
  AlertCircle,
  Calendar,
  MapPin,
  Tag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ImageIcon,
  X,
  Loader2,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import StatusBadge from '../components/StatusBadge'
import MapViewer from '../components/MapViewer'

export default function CekStatus() {
  const location = useLocation()

  // Ambil data preset jika dialihkan dari halaman konfirmasi
  const presetReportNumber = location.state?.presetReportNumber || ''
  const presetAccessCode = location.state?.presetAccessCode || ''

  const [reportNumber, setReportNumber] = useState(presetReportNumber)
  const [accessCode, setAccessCode] = useState(presetAccessCode)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [activeImageModal, setActiveImageModal] = useState(null)

  // Otomatis cek jika diarahkan langsung dengan preset data
  useEffect(() => {
    if (presetReportNumber && presetAccessCode) {
      handleCheck(presetReportNumber, presetAccessCode)
    }
  }, [presetReportNumber, presetAccessCode])

  const handleCheck = async (rNum = reportNumber, aCode = accessCode) => {
    const cleanNum = rNum.trim().toUpperCase()
    const cleanCode = aCode.trim().toUpperCase()

    if (!cleanNum) {
      setErrorMsg('Masukkan Nomor Laporan Anda.')
      return
    }
    if (!cleanCode) {
      setErrorMsg('Masukkan Kode Akses Rahasia Anda.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setReportData(null)

    try {
      const { data, error } = await supabase.rpc('get_public_report_status', {
        p_report_number: cleanNum,
        p_access_code: cleanCode,
      })

      if (error) {
        throw new Error('Laporan tidak ditemukan atau kombinasi Nomor Laporan dan Kode Akses tidak sesuai.')
      }

      setReportData(data)
    } catch (err) {
      console.error('Check status error:', err)
      setErrorMsg(err.message || 'Gagal memeriksa status laporan.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleCheck()
  }

  // Format tanggal ke Bahasa Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#064E46]/10 text-[#064E46] text-xs font-semibold mb-3">
          <Search className="w-3.5 h-3.5" />
          <span>Pelacakan Transparan</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2E2E2E]">
          Cek Status Laporan Anda
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Masukkan Nomor Laporan dan Kode Akses Rahasia yang Anda dapatkan saat melapor untuk melihat perkembangan penanganan.
        </p>
      </div>

      {/* Input Form Search Box */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 mb-8">
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Nomor Laporan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="SMP-20261114-XXXX"
                  value={reportNumber}
                  onChange={(e) => setReportNumber(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Kode Akses Rahasia <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: X7K9A2"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm font-mono uppercase"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white py-3.5 rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa Database...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Lacak Status Laporan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Report Detail Result */}
      {reportData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Header Banner */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-gray-400 tracking-wider">
                {reportData.report_number}
              </span>
              <h2 className="text-2xl font-bold text-gray-900">{reportData.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(reportData.created_at)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {reportData.rt_number} ({reportData.area_name})
                </span>
              </div>
            </div>
            <StatusBadge status={reportData.status} size="lg" />
          </div>

          {/* Alert Rejection Reason (jika status ditolak) */}
          {reportData.status === 'Ditolak' && reportData.rejection_reason && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-red-900 text-sm sm:text-base">
                  Laporan Ditolak oleh Admin RW
                </h4>
                <p className="text-sm text-red-700 leading-relaxed">
                  <strong>Alasan Penolakan:</strong> {reportData.rejection_reason}
                </p>
                <p className="text-xs text-red-500 pt-1">
                  Jika Anda merasa informasi ini keliru, silakan hubungi kontak sekretariat RW 05 atau buat laporan baru dengan data yang lebih akurat.
                </p>
              </div>
            </div>
          )}

          {/* Grid Detail Laporan & Peta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informasi Deskripsi & Kategori */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2">
                Deskripsi Kondisi
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Kategori Sampah</span>
                  <span className="font-medium text-gray-800">{reportData.category_name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Patokan Alamat</span>
                  <span className="font-medium text-gray-800">{reportData.address}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Keterangan Tambahan</span>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded-xl mt-1">
                    {reportData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Peta Titik Koordinat */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 space-y-3">
              <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#064E46]" />
                <span>Titik Lokasi Sampah</span>
              </h3>
              <MapViewer
                latitude={reportData.latitude}
                longitude={reportData.longitude}
                address={reportData.address}
              />
              <span className="text-[11px] font-mono text-gray-500 block text-right">
                Koordinat: {Number(reportData.latitude).toFixed(5)}, {Number(reportData.longitude).toFixed(5)}
              </span>
            </div>
          </div>

          {/* Galeri Foto Bukti */}
          {reportData.images && reportData.images.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#064E46]" />
                <span>Foto Bukti Lapangan ({reportData.images.length} Foto)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {reportData.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageModal(img.image_url)}
                    className="aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-[#2C6705] hover:opacity-95 transition-all shadow-2xs group relative cursor-pointer"
                  >
                    <img
                      src={img.image_url}
                      alt={`Bukti ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      Perbesar
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Riwayat Perkembangan Status */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#064E46]" />
                <span>Riwayat Perkembangan Laporan</span>
              </h3>
              <span className="text-xs text-gray-400">Diperbarui real-time</span>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-200 space-y-8 my-4 ml-3 sm:ml-4">
              {reportData.history && reportData.history.length > 0 ? (
                reportData.history.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-[#064E46] text-white flex items-center justify-center text-xs shadow-sm ring-4 ring-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div className="bg-[#F8F9F4] p-4 rounded-xl border border-gray-200/80 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <StatusBadge status={hist.new_status} size="sm" />
                        <span className="text-xs text-gray-500">
                          {formatDate(hist.created_at)}
                        </span>
                      </div>
                      {hist.public_note && (
                        <p className="text-sm text-gray-700 leading-relaxed pt-1">
                          {hist.public_note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada riwayat penanganan tambahan.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveImageModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2 cursor-pointer"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={activeImageModal}
              alt="Foto Diperbesar"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
