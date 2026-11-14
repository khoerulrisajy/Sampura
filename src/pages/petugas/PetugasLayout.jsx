import React from 'react'
import { Link, NavLink, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Truck,
  ArrowLeft,
  Clock,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function PetugasLayout() {
  const { profile } = useOutletContext() || {}
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard Jadwal', path: '/petugas/dashboard', icon: LayoutDashboard },
    { name: 'Kelola Jadwal Pengangkutan', path: '/petugas/jadwal', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topbar Petugas */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left brand & badge */}
            <div className="flex items-center gap-3">
              <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors" title="Lihat Website Publik">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <Link to="/petugas/dashboard" className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-[#2C6705]">SAMPURA</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  <span>Petugas Kebersihan</span>
                </span>
              </Link>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#2C6705]/10 text-[#2C6705] font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </nav>

            {/* Right User info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-right">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  {profile?.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block leading-tight">
                    {profile?.full_name || 'Petugas Operasional'}
                  </span>
                  <span className="text-[10px] text-gray-500 block leading-none">
                    Dinas Kebersihan RW 05
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden border-t border-gray-100 px-4 py-2 flex items-center justify-around bg-gray-50/80">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-[#2C6705]/10 text-[#2C6705] font-semibold'
                      : 'text-gray-600'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ profile }} />
      </main>
    </div>
  )
}
