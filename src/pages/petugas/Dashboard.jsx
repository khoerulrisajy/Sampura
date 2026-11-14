import React, { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RefreshCw,
  MapPin,
  ArrowRight,
  Truck,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function PetugasDashboard() {
  const { profile } = useOutletContext() || {}
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('collection_schedules')
        .select('*')
        .order('area', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (err) {
      console.error('Error fetching schedules stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const total = schedules.length
  const activeCount = schedules.filter((s) => s.is_active).length
  const inactiveCount = total - activeCount

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-blue-200 block">
            Portal Operasional Pengangkutan Sampah
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Selamat Datang, {profile?.full_name || 'Petugas Kebersihan'}!
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Kelola jadwal pengangkutan sampah warga RW 05 Batam Nirwana agar informasi yang tampil di publik selalu akurat.
          </p>
        </div>
        <Link
          to="/petugas/jadwal"
          className="inline-flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 px-5 py-3 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Kelola / Tambah Jadwal</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Total Jadwal</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-3xl font-black text-gray-900 block">{total}</span>
          <span className="text-xs text-gray-400 mt-1 block">Seluruh jadwal terdaftar</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase">Jadwal Aktif</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-emerald-700 block">{activeCount}</span>
          <span className="text-xs text-gray-400 mt-1 block">Tampil di halaman publik warga</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase">Jadwal Nonaktif</span>
            <XCircle className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-3xl font-black text-amber-700 block">{inactiveCount}</span>
          <span className="text-xs text-gray-400 mt-1 block">Disembunyikan sementara</span>
        </div>
      </div>

      {/* Active Schedules Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-700" />
            <span>Daftar Jadwal Pengangkutan Saat Ini</span>
          </h2>
          <Link
            to="/petugas/jadwal"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Buka Pengelolaan Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Memuat jadwal pengangkutan...
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-gray-500 text-sm">Belum ada jadwal pengangkutan yang dibuat.</p>
            <Link
              to="/petugas/jadwal"
              className="inline-flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Jadwal Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>{s.area}</span>
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-semibold text-gray-700">{s.day}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {s.start_time?.slice(0, 5)} {s.end_time ? `- ${s.end_time?.slice(0, 5)} WIB` : 'WIB s/d Selesai'}
                    </span>
                    {s.description && <span>• {s.description}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      s.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {s.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
