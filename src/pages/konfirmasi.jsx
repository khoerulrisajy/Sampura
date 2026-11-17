import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Check } from 'lucide-react'

export default function Konfirmasi() {
  const location = useLocation()
  const stateData = location.state || {}
  const reportNumber = stateData.reportNumber || 'LPR-012'

  return (
    <div className="bg-[#DDF2E5]/50 min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#C7D8CF]/70 shadow-sm p-8 sm:p-10 text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Green Checkmark Circle (Sesuai Page 3 Bottom) */}
        <div className="w-16 h-16 rounded-full bg-[#064E46] text-white flex items-center justify-center mx-auto shadow-md">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E46] tracking-tight">
            Terima Kasih!
          </h1>
          <p className="text-xs text-[#064E46]/80 leading-relaxed font-medium">
            Laporan Anda telah berhasil dikirim.<br />
            Nomor laporan Anda adalah:
          </p>
        </div>

        {/* Report Number Pill Badge */}
        <div>
          <span className="inline-block px-6 py-2 bg-[#6FB493] text-white font-bold text-sm sm:text-base rounded-full shadow-xs tracking-wide">
            {reportNumber}
          </span>
        </div>

        {/* Info Text */}
        <p className="text-xs text-[#55766B] leading-relaxed max-w-xs mx-auto">
          Anda dapat memantau status laporan melalui menu{' '}
          <Link to="/cek-status" className="font-bold text-[#064E46] hover:underline">
            Cek Status
          </Link>{' '}
          atau di halaman{' '}
          <Link to="/cek-status" className="font-bold text-[#064E46] hover:underline">
            Laporan Saya
          </Link>
          .
        </p>

        {/* Action Button: Kembali Ke Beranda */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#064E46] hover:bg-[#0B594E] text-white font-bold text-xs shadow-md transition-all"
          >
            Kembali Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
