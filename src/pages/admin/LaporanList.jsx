import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
  Tag,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import StatusBadge from '../../components/StatusBadge'

export default function LaporanList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStatusFilter = searchParams.get('status') || ''

  const [reports, setReports] = useState([])
  const [rtList, setRtList] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter)
  const [selectedRt, setSelectedRt] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const fetchReports = async () => {
    setLoading(true)
    try {
      const [repRes, rtRes, catRes] = await Promise.all([
        supabase
          .from('reports')
          .select(`
            id,
            report_number,
            title,
            address,
            reporter_name,
            reporter_phone,
            status,
            created_at,
            rt_areas (id, rt_number, area_name),
            categories (id, name)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('rt_areas').select('*').order('rt_number'),
        supabase.from('categories').select('*').order('name'),
      ])

      if (repRes.error) throw repRes.error
      setReports(repRes.data || [])
      setRtList(rtRes.data || [])
      setCategories(catRes.data || [])
    } catch (err) {
      console.error('Error fetching admin reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Update query param bila status berubah
  useEffect(() => {
    if (selectedStatus) {
      setSearchParams({ status: selectedStatus })
    } else {
      setSearchParams({})
    }
  }, [selectedStatus, setSearchParams])

  // Filter client-side
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.report_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reporter_name && r.reporter_name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = selectedStatus ? r.status === selectedStatus : true
    const matchesRt = selectedRt ? r.rt_areas?.id === selectedRt : true
    const matchesCategory = selectedCategory ? r.categories?.id === selectedCategory : true

    return matchesSearch && matchesStatus && matchesRt && matchesCategory
  })

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('')
    setSelectedRt('')
    setSelectedCategory('')
  }

  const hasActiveFilters = searchQuery || selectedStatus || selectedRt || selectedCategory

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Pengaduan Sampah</h1>
          <p className="text-sm text-gray-500">
            Kelola dan tindak lanjuti seluruh laporan sampah warga RW 05 Batam Nirwana.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReports}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor, judul, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#2C6705] text-xs"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#2C6705] text-xs bg-white"
            >
              <option value="">Semua Status Laporan</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Diteruskan ke Pemerintah">Diteruskan ke Pemerintah</option>
              <option value="Dalam Penanganan">Dalam Penanganan</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          {/* RT Filter */}
          <div>
            <select
              value={selectedRt}
              onChange={(e) => setSelectedRt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#2C6705] text-xs bg-white"
            >
              <option value="">Semua Wilayah RT</option>
              {rtList.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.rt_number} ({rt.area_name})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#2C6705] text-xs bg-white"
            >
              <option value="">Semua Kategori Sampah</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
            <span className="text-gray-500">
              Ditemukan <strong>{filteredReports.length}</strong> dari total {reports.length} laporan.
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Reports Table / List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Memuat data laporan warga...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-gray-600 font-semibold text-sm">Tidak ada laporan yang sesuai kriteria.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#2C6705] font-semibold hover:underline cursor-pointer"
              >
                Hapus semua filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">No. Laporan</th>
                  <th className="py-3 px-4">Judul & Lokasi</th>
                  <th className="py-3 px-4">Kategori & RT</th>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {r.report_number}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-gray-900 line-clamp-1">{r.title}</div>
                      <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{r.address}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{r.categories?.name || '-'}</div>
                      <div className="text-[11px] text-gray-500">{r.rt_areas?.rt_number || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/laporan/${r.id}`}
                        className="inline-flex items-center gap-1 bg-[#2C6705] hover:bg-[#235204] text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-2xs"
                      >
                        <span>Kelola</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
