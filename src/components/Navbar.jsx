import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Lapor Sampah', path: '/lapor' },
    { name: 'Jadwal Pengangkutan', path: '/jadwal' },
    { name: 'Cek Status', path: '/cek-status' },
    { name: 'Tentang & FAQ', path: '/panduan' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white border-b border-[#C7D8CF]/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand Name */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-hidden">
          <div className="text-[#064E46] transition-transform group-hover:scale-105 duration-200">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 32 32"
            >
              <rect height="15" rx="2" width="17" x="2" y="7"></rect>
              <path d="M19 12h5.5l3.5 4v6h-9"></path>
              <circle cx="8" cy="24" r="2.5"></circle>
              <circle cx="23" cy="24" r="2.5"></circle>
              <path
                d="M10 13c1.5 0 3-1 3-2.5s-1.5-2.5-3-2.5c0 1.5 1 3 2.5 3z"
                fill="currentColor"
                opacity="0.85"
                stroke="none"
              ></path>
            </svg>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#064E46]">
            sampura<span className="text-[#176B50]">.</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 lg:space-x-9 text-[15px] font-semibold text-[#064E46]/85">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 transition-colors ${
                  active
                    ? "text-[#064E46] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#064E46] after:rounded-full"
                    : 'text-[#064E46]/75 hover:text-[#064E46]'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Right Action Button: Admin */}
        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#064E46] text-white font-medium text-sm hover:bg-[#0B594E] transition-colors shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#064E46]"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-full bg-[#064E46] text-white font-medium text-xs"
          >
            Admin
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[#064E46] hover:bg-[#DDF2E5]/50 focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-[#C7D8CF] bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                  active
                    ? 'text-[#064E46] bg-[#DDF2E5] font-bold'
                    : 'text-[#064E46]/80 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
