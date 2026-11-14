import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#F5F9F7] border-t border-[#C7D8CF]/60 py-8 text-center mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#064E46]/80">
          <Link to="/" className="hover:text-[#064E46] transition-colors">
            Beranda
          </Link>
          <Link to="/lapor" className="hover:text-[#064E46] transition-colors">
            Lapor Sampah
          </Link>
          <Link to="/jadwal" className="hover:text-[#064E46] transition-colors">
            Jadwal Pengangkutan
          </Link>
          <Link to="/cek-status" className="hover:text-[#064E46] transition-colors">
            Cek Status
          </Link>
          <Link to="/panduan" className="hover:text-[#064E46] transition-colors">
            Panduan & FAQ
          </Link>
          <Link to="/login" className="hover:text-[#064E46] transition-colors">
            Portal Admin
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-[#55766B] font-medium pt-2 border-t border-[#C7D8CF]/40">
          © {new Date().getFullYear()} Sampura Kota Batam. Bersama Jaga Lingkungan Bersih dan Sehat.
        </p>
      </div>
    </footer>
  )
}
