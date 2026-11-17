import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import {
  Mail,
  Settings,
  Bell,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
  Calendar,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminLayout() {
  const { profile } = useOutletContext() || {}
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { count, error } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Menunggu Verifikasi')

        if (!error && count !== null) {
          setUnreadCount(count)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchPending()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-[#F5F9F7]">
      {/* 1. DARK GREEN SIDEBAR (Sesuai Page 8 & 9) */}
      <aside className="w-64 bg-[#064E46] text-white flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="space-y-8">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="text-white">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.9"
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
            <span className="text-xl font-bold tracking-tight text-white">
              sampura<span className="text-emerald-400">.</span>
            </span>
          </Link>

          {/* Sidebar Nav Items */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan</span>
            </NavLink>

            <NavLink
              to="/admin/laporan"
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Laporan Masuk</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-900">
                  {unreadCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/admin/jadwal"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Calendar className="w-4 h-4" />
              <span>Jadwal Pengangkutan</span>
            </NavLink>

            <NavLink
              to="/admin/pengaturan"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer (Sesuai Page 9: v1.0.0 • Batam) */}
        <div className="space-y-3 pt-6 border-t border-white/10 text-[11px] text-white/50">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
          <div className="flex items-center justify-between">
            <span>© 2026 Sampura Batam</span>
            <span className="text-[10px] text-emerald-300/80 font-mono">v1.0.0 • Batam</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-20 bg-white border-b border-[#C7D8CF]/60 px-6 sm:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors" title="Kembali ke Beranda">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xs font-bold text-[#064E46] uppercase tracking-wider hidden sm:inline">
              Portal Admin RW
            </span>
          </div>

          {/* Right: Bell & Profile Avatar (Sesuai Page 9) */}
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-[#064E46] p-1.5 rounded-full hover:bg-gray-50 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#064E46] text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-gray-800">
                {profile?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10">
          <Outlet context={{ profile }} />
        </main>
      </div>
    </div>
  )
}
