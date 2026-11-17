import React, { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Clock,
  XCircle,
  Send,
  PlayCircle,
  CheckCircle2,
  FileText,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import StatusBadge from '../../components/StatusBadge'

export default function AdminDashboard() {
  const { profile } = useOutletContext() || {}
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    ditolak: 0,
    diteruskan: 0,
    penanganan: 0,
    selesai: 0,
  })
  const [recentReports, setRecentReports] = useState([])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Ambil seluruh data reports untuk kalkulasi statistik
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          report_number,
          title,
          status,
          created_at,
          rt_areas (rt_number),
          categories (name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const all = data || []
      setStats({
        total: all.length,
        menunggu: all.filter((r) => r.status === 'Menunggu Verifikasi').length,
        ditolak: all.filter((r) => r.status === 'Ditolak').length,
        diteruskan: all.filter((r) => r.status === 'Diteruskan ke Pemerintah').length,
        penanganan: all.filter((r) => r.status === 'Dalam Penanganan').length,
        selesai: all.filter((r) => r.status === 'Selesai').length,
      })

      // Ambil 5 laporan terbaru
      setRecentReports(all.slice(0, 5))
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const statCards = [
    {
      label: 'Menunggu Verifikasi',
      count: stats.menunggu,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      filter: 'Menunggu Verifikasi',
      urgent: stats.menunggu > 0,
    },
    {
      label: 'Diteruskan ke Pemerintah',
      count: stats.diteruskan,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Send,
      filter: 'Diteruskan ke Pemerintah',
    },
    {
      label: 'Dalam Penanganan',
      count: stats.penanganan,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: PlayCircle,
      filter: 'Dalam Penanganan',
    },
    {
      label: 'Selesai',
      count: stats.selesai,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      filter: 'Selesai',
    },
    {
      label: 'Ditolak',
      count: stats.ditolak,
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      filter: 'Ditolak',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#064E46] to-[#0B594E] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 block">
            Portal Kelola RW 05 Batam Nirwana
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Selamat Datang, {profile?.full_name || 'Admin RW'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Pantau dan verifikasi pengaduan sampah warga sebelum diteruskan ke dinas kebersihan pemerintah.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-full text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Urgent Notice if any report needs verification */}
      {stats.menunggu > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm text-amber-900 font-medium">
              Ada <strong>{stats.menunggu} laporan warga</strong> yang baru masuk dan butuh verifikasi Anda segera.
            </span>
          </div>
          <Link
            to="/admin/laporan"
            className="shrink-0 text-xs font-bold text-amber-900 hover:bg-amber-300 bg-amber-200 px-4 py-1.5 rounded-full transition-colors"
          >
            Lihat Laporan
          </Link>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Card */}
        <div className="bg-white border border-[#C7D8CF] rounded-2xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs text-gray-500 font-medium block">Total Pengaduan</span>
          <span className="text-2xl sm:text-3xl font-black text-[#064E46] mt-1 block">
            {stats.total}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">Seluruh laporan se-RW</span>
        </div>

        {statCards.map((c, i) => {
          const Icon = c.icon
          return (
            <Link
              key={i}
              to="/admin/laporan"
              className={`border rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all group flex flex-col justify-between ${c.color}`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4" />
                {c.urgent && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black block group-hover:scale-105 transition-transform">
                  {c.count}
                </span>
                <span className="text-xs font-medium block mt-0.5 line-clamp-1">
                  {c.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white rounded-2xl border border-[#C7D8CF]/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-[#064E46] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#064E46]" />
            <span>Laporan Terbaru Masuk</span>
          </h2>
          <Link
            to="/admin/laporan"
            className="text-xs font-semibold text-[#064E46] hover:text-[#0B594E] flex items-center gap-1 hover:underline"
          >
            <span>Lihat Semua Laporan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Memuat daftar laporan terbaru...
          </div>
        ) : recentReports.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-xs">
            Belum ada laporan pengaduan sampah yang masuk.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentReports.map((r) => (
              <div
                key={r.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {r.report_number}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-[#064E46]">
                      {r.rt_areas?.rt_number || 'RT'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {r.categories?.name || 'Umum'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{r.title}</h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={r.status} size="sm" />
                  <Link
                    to={`/admin/laporan/${r.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#064E46] bg-[#DDF2E5]/70 hover:bg-[#DDF2E5] px-3.5 py-1.5 rounded-full transition-colors"
                  >
                    <span>Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
