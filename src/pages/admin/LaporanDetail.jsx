import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  User,
  Phone,
  FileText,
  Clock,
  Send,
  XCircle,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
  Lock,
  Loader2,
  ImageIcon,
  X,
  Share2,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import StatusBadge from '../../components/StatusBadge'
import MapViewer from '../../components/MapViewer'

export default function LaporanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useOutletContext() || {}

  const [report, setReport] = useState(null)
  const [images, setImages] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  // Modal State
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const [showForwardModal, setShowForwardModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const [newStatus, setNewStatus] = useState('Dalam Penanganan')
  const [publicNote, setPublicNote] = useState('')
  const [internalNote, setInternalNote] = useState('')

  const [isProcessing, setIsProcessing] = useState(false)
  const [activeImageZoom, setActiveImageZoom] = useState(null)

  const fetchDetail = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      // 1. Ambil data laporan
      const { data: repData, error: repErr } = await supabase
        .from('reports')
        .select(`
          *,
          rt_areas (id, rt_number, rw_number, area_name),
          categories (id, name),
          forwarded_profile:forwarded_by (full_name)
        `)
        .eq('id', id)
        .single()

      if (repErr) throw repErr

      // 2. Ambil foto-foto bukti
      const { data: imgData } = await supabase
        .from('report_images')
        .select('*')
        .eq('report_id', id)

      // 3. Ambil riwayat status (termasuk internal_note)
      const { data: histData } = await supabase
        .from('report_status_history')
        .select(`
          *,
          changed_profile:changed_by (full_name)
        `)
        .eq('report_id', id)
        .order('created_at', { ascending: true })

      setReport(repData)
      setImages(imgData || [])
      setHistory(histData || [])
    } catch (err) {
      console.error('Error fetching report detail:', err)
      setErrorMsg('Gagal memuat detail laporan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  // Aksi 1: Tolak Laporan
  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectionReason.trim()) {
      alert('Alasan penolakan wajib diisi!')
      return
    }

    setIsProcessing(true)
    try {
      const { error } = await supabase.rpc('admin_update_report_status', {
        p_report_id: id,
        p_new_status: 'Ditolak',
        p_rejection_reason: rejectionReason.trim(),
        p_public_note: `Laporan ditolak oleh Admin RW: ${rejectionReason.trim()}`,
        p_internal_note: `Alasan penolakan dicatat oleh ${profile?.full_name || 'Admin'}`,
      })

      if (error) throw error

      setShowRejectModal(false)
      fetchDetail()
    } catch (err) {
      console.error('Reject error:', err)
      alert(err.message || 'Gagal menolak laporan.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Format Pesan WhatsApp Resmi
  const generateWhatsAppMessage = () => {
    if (!report) return ''
    const photoUrls = images.map((img, i) => `${i + 1}. ${img.image_url}`).join('\n')
    const mapsUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`

    return `*PENGADUAN SAMPAH - RW 05 BATAM NIRWANA*
----------------------------------------
*No. Laporan:* ${report.report_number}
*Wilayah:* ${report.rt_areas?.rt_number} (${report.rt_areas?.area_name})
*Kategori:* ${report.categories?.name}
*Judul:* ${report.title}

*Patokan Alamat:*
${report.address}

*Titik Peta Lokasi:*
${mapsUrl}

*Keterangan Masalah:*
${report.description}
${photoUrls ? `\n*Foto Bukti Lapangan:*\n${photoUrls}` : ''}

_Laporan ini telah diverifikasi oleh Admin RW 05 Batam Nirwana dan diteruskan untuk mohon bantuan tindak lanjut pengangkutan. Terima kasih._`
  }

  // Buka WhatsApp Web / App
  const handleOpenWhatsApp = () => {
    const text = generateWhatsAppMessage()
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

  // Konfirmasi Status Diteruskan
  const handleConfirmForwarded = async () => {
    setIsProcessing(true)
    try {
      const { error } = await supabase.rpc('admin_update_report_status', {
        p_report_id: id,
        p_new_status: 'Diteruskan ke Pemerintah',
        p_public_note: 'Laporan valid telah diverifikasi Admin RW dan diteruskan resmi ke pihak kebersihan pemerintah via WhatsApp.',
        p_internal_note: `Diteruskan via WhatsApp oleh ${profile?.full_name || 'Admin RW'}.`,
      })

      if (error) throw error

      setShowForwardModal(false)
      fetchDetail()
    } catch (err) {
      console.error('Forward error:', err)
      alert(err.message || 'Gagal memperbarui status diteruskan.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Aksi 3: Pembaruan Status Lanjutan (Dalam Penanganan / Selesai)
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const defaultPublicNote =
        newStatus === 'Dalam Penanganan'
          ? 'Pemerintah/dinas kebersihan telah mengonfirmasi bahwa masalah sampah ini sedang ditangani di lapangan.'
          : 'Pemerintah/petugas kebersihan telah mengonfirmasi bahwa masalah sampah ini telah selesai dibersihkan.'

      const { error } = await supabase.rpc('admin_update_report_status', {
        p_report_id: id,
        p_new_status: newStatus,
        p_public_note: publicNote.trim() || defaultPublicNote,
        p_internal_note: internalNote.trim() || null,
      })

      if (error) throw error

      setShowUpdateModal(false)
      fetchDetail()
    } catch (err) {
      console.error('Update status error:', err)
      alert(err.message || 'Gagal memperbarui status laporan.')
    } finally {
      setIsProcessing(false)
    }
  }

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

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#064E46] mx-auto mb-3" />
        <p className="text-sm">Memuat rincian laporan pengaduan...</p>
      </div>
    )
  }

  if (errorMsg || !report) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
        <p>{errorMsg || 'Data laporan tidak ditemukan.'}</p>
        <Link
          to="/admin/laporan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-4 py-2 rounded-full shadow-2xs text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Laporan</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Action Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/laporan"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#064E46] hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Laporan</span>
        </Link>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {report.status === 'Menunggu Verifikasi' && (
            <>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak Laporan</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForwardModal(true)}
                className="inline-flex items-center gap-1.5 bg-[#064E46] hover:bg-[#0B594E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Teruskan ke WhatsApp Pemerintah</span>
              </button>
            </>
          )}

          {report.status !== 'Ditolak' && report.status !== 'Menunggu Verifikasi' && (
            <button
              type="button"
              onClick={() => {
                setNewStatus(report.status === 'Diteruskan ke Pemerintah' ? 'Dalam Penanganan' : 'Selesai')
                setPublicNote('')
                setInternalNote('')
                setShowUpdateModal(true)
              }}
              className="inline-flex items-center gap-1.5 bg-[#064E46] hover:bg-[#0B594E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Perbarui Status Penanganan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl border border-[#C7D8CF]/80 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-400">
              {report.report_number}
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs font-bold text-[#064E46]">
              {report.rt_areas?.rt_number}
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-medium">
              {report.categories?.name}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#064E46]">{report.title}</h1>
          <p className="text-xs text-gray-500">
            Diterima sistem pada: {formatDate(report.created_at)}
          </p>
        </div>
        <StatusBadge status={report.status} size="lg" />
      </div>

      {/* Rejection Alert if rejected */}
      {report.status === 'Ditolak' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-900 text-sm">Laporan Ditolak</h4>
            <p className="text-sm text-red-700 leading-relaxed">
              <strong>Alasan Penolakan:</strong> {report.rejection_reason}
            </p>
          </div>
        </div>
      )}

      {/* Grid: Details and Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Data Detail */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Data Pengaduan Warga
          </h3>

          <div className="space-y-3 text-xs">
            {/* Reporter Data */}
            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-200/60">
              <span className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">
                Identitas Pelapor
              </span>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Nama Pelapor:</span>
                <span className="font-semibold text-gray-900">
                  {report.reporter_name || 'Anonim (Tidak dicantumkan)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Nomor Telepon:</span>
                {report.reporter_phone ? (
                  <a
                    href={`https://wa.me/${report.reporter_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{report.reporter_phone}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-gray-400">Tidak dicantumkan</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-semibold uppercase block text-[10px]">Patokan Alamat</span>
              <span className="text-sm font-medium text-gray-800">{report.address}</span>
            </div>

            <div>
              <span className="text-gray-500 font-semibold uppercase block text-[10px]">Deskripsi Masalah</span>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl mt-1 leading-relaxed whitespace-pre-line border border-gray-200/60">
                {report.description}
              </p>
            </div>

            {report.forwarded_at && (
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                Diteruskan ke pemerintah pada: <strong>{formatDate(report.forwarded_at)}</strong>
                {report.forwarded_profile?.full_name && ` oleh ${report.forwarded_profile.full_name}`}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Peta Lokasi */}
        <div className="bg-white rounded-3xl border border-[#C7D8CF]/80 shadow-xs p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#064E46]" />
              <span>Titik Lokasi Sampah</span>
            </h3>
            <a
              href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#064E46] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Buka Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <MapViewer
            latitude={report.latitude}
            longitude={report.longitude}
            address={report.address}
          />
          <span className="text-[11px] font-mono text-gray-400 block text-right">
            {report.latitude}, {report.longitude}
          </span>
        </div>
      </div>

      {/* Foto Bukti Lapangan */}
      {images.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#C7D8CF]/80 shadow-xs p-6 space-y-3">
          <h3 className="font-bold text-[#064E46] text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#064E46]" />
            <span>Foto Bukti Lapangan ({images.length} Foto)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImageZoom(img.image_url)}
                className="aspect-square rounded-2xl overflow-hidden border border-[#C7D8CF] hover:border-[#064E46] transition-all relative group cursor-pointer shadow-2xs"
              >
                <img
                  src={img.image_url}
                  alt={`Bukti ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-[#064E46]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                  Lihat Foto
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat Status Lengkap (Termasuk Catatan Internal) */}
      <div className="bg-white rounded-3xl border border-[#C7D8CF]/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-[#064E46] text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#064E46]" />
            <span>Log Riwayat Status & Catatan Internal</span>
          </h3>
          <span className="text-xs text-gray-400">Arsip Pengelola</span>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#DDF2E5] space-y-6 my-4 ml-3 sm:ml-4">
          {history.map((hist) => (
            <div key={hist.id} className="relative">
              <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-[#064E46] text-white flex items-center justify-center text-xs shadow-sm ring-4 ring-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <StatusBadge status={hist.new_status} size="sm" />
                  <span className="text-xs text-gray-400">
                    {formatDate(hist.created_at)}
                  </span>
                </div>

                {/* Catatan Publik */}
                {hist.public_note && (
                  <div className="text-xs text-gray-700 pt-1">
                    <span className="font-bold text-gray-500 uppercase text-[10px] block">Catatan Publik:</span>
                    <p className="leading-relaxed">{hist.public_note}</p>
                  </div>
                )}

                {/* Catatan Internal */}
                {hist.internal_note && (
                  <div className="text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/80 mt-2">
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase text-amber-800 mb-0.5">
                      <Lock className="w-3 h-3" />
                      <span>Catatan Khusus Internal Admin:</span>
                    </div>
                    <p className="leading-relaxed">{hist.internal_note}</p>
                  </div>
                )}

                {hist.changed_profile?.full_name && (
                  <span className="text-[11px] text-gray-400 block pt-1">
                    Diubah oleh: {hist.changed_profile.full_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Tolak Laporan */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>Tolak Laporan Warga</span>
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Alasan penolakan ini <strong>akan ditampilkan secara transparan</strong> kepada warga pelapor di menu Cek Status.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Lokasi berada di luar cakupan RW 05, atau foto bukti tidak menunjukkan tumpukan sampah."
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  <span>Konfirmasi Tolak</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Teruskan ke WhatsApp Pemerintah */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-[#064E46]">
                <Send className="w-5 h-5" />
                <span>Teruskan ke Instansi Pemerintah</span>
              </h3>
              <button onClick={() => setShowForwardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <p>
                Langkah 1: Klik tombol <strong>"Buka WhatsApp"</strong> di bawah untuk membuka draf pesan pengaduan resmi.
              </p>
              <div className="bg-[#F5F9F7] p-3.5 rounded-2xl border border-[#C7D8CF] font-mono text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap text-gray-800">
                {generateWhatsAppMessage()}
              </div>
              <p className="text-[#064E46] bg-[#DDF2E5] p-3 rounded-2xl border border-[#C7D8CF]/80">
                Langkah 2: Setelah pesan terkirim di WhatsApp ke kontak dinas, klik tombol <strong>"Konfirmasi Terkirim"</strong> di bawah untuk memperbarui status di dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buka WhatsApp</span>
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmForwarded}
                className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white py-2.5 rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Konfirmasi Terkirim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Pembaruan Status Lanjutan */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-[#064E46]">
                <Clock className="w-5 h-5" />
                <span>Perbarui Status Laporan</span>
              </h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Status Baru
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                >
                  <option value="Dalam Penanganan">Dalam Penanganan (Pemerintah sedang bertindak)</option>
                  <option value="Selesai">Selesai (Sampah telah bersih tuntas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Catatan Publik (Tampil ke Warga)
                </label>
                <textarea
                  rows={2}
                  value={publicNote}
                  onChange={(e) => setPublicNote(e.target.value)}
                  placeholder="Informasi yang dapat dibaca warga di menu Cek Status..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Catatan Internal (Khusus Arsip Admin RW)</span>
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Catatan rahasia/koordinasi internal yang tidak tampil ke publik..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 text-xs font-bold bg-[#064E46] hover:bg-[#0B594E] text-white rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto */}
      {activeImageZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveImageZoom(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setActiveImageZoom(null)}
              className="absolute -top-10 right-0 text-white p-2"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={activeImageZoom}
              alt="Bukti Foto"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
