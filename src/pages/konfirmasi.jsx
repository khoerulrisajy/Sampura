import React, { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Search,
  Home,
  ShieldCheck,
} from 'lucide-react'

export default function Konfirmasi() {
  const location = useLocation()
  const navigate = useNavigate()

  // Ambil data yang dikirim dari form Lapor Sampah
  const stateData = location.state || {}
  const reportNumber = stateData.reportNumber || 'SMP-CONTOH-0001'
  const accessCode = stateData.accessCode || 'XXXXXX'
  const title = stateData.title || 'Laporan Pengaduan'

  const [copiedReport, setCopiedReport] = useState(false)
  const [copiedAccess, setCopiedAccess] = useState(false)

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'report') {
      setCopiedReport(true)
      setTimeout(() => setCopiedReport(false), 2000)
    } else {
      setCopiedAccess(true)
      setTimeout(() => setCopiedAccess(false), 2000)
    }
  }

  const handleGoToCekStatus = () => {
    navigate('/cek-status', {
      state: {
        presetReportNumber: reportNumber,
        presetAccessCode: accessCode,
      },
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-lg p-6 sm:p-10 space-y-8 animate-in zoom-in-95 duration-200">
        {/* Success Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-[#064E46] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-[#064E46] bg-[#064E46]/10 px-3 py-1 rounded-full">
            Laporan Berhasil Terkirim
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Terima Kasih Atas Laporan Anda!
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Laporan pengaduan Anda telah masuk ke sistem dan akan segera diverifikasi oleh pengurus Admin RW.
          </p>
        </div>

        {/* Credentials Cards */}
        <div className="space-y-4">
          {/* Nomor Laporan */}
          <div className="bg-[#F8F9F4] border border-gray-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">
                Nomor Laporan
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-gray-900 tracking-wide">
                {reportNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(reportNumber, 'report')}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Kode Akses Rahasia */}
          <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Kode Akses Rahasia
                </span>
                <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                  Penting!
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-950 tracking-widest">
                {accessCode}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(accessCode, 'access')}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {copiedAccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Pemberitahuan Keamanan Privasi:</span>
            <p className="leading-relaxed text-red-700">
              Kode Akses Rahasia di atas <strong>hanya ditampilkan satu kali</strong> pada layar ini. Harap simpan atau catat sekarang karena Anda akan membutuhkannya untuk memantau status laporan Anda.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleGoToCekStatus}
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white py-3.5 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Cek Status Sekarang</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
