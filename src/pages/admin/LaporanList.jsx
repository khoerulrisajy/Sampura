import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function LaporanList() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchReports = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          report_number,
          title,
          address,
          status,
          created_at,
          rt_areas (rt_number, area_name),
          categories (name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId)

      if (error) throw error

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      )
    } catch (err) {
      console.error(err)
      alert('Gagal memperbarui status.')
    }
  }

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.report_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'Selesai') {
      matchesStatus = r.status === 'Selesai'
    } else if (statusFilter === 'Diproses') {
      matchesStatus = r.status === 'Dalam Penanganan' || r.status === 'Diteruskan ke Pemerintah'
    } else if (statusFilter === 'Menunggu') {
      matchesStatus = r.status === 'Menunggu Verifikasi'
    } else if (statusFilter === 'Ditolak') {
      matchesStatus = r.status === 'Ditolak'
    }

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString) => {
    if (!dateString) return '27/07/2026'
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title & Subtitle (Sesuai Page 8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#064E46] tracking-tight">Laporan Masuk</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola laporan sampah yang masuk dari masyarakat.
          </p>
        </div>

        {/* Quick Summary Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === ''
                ? 'bg-[#064E46] text-white shadow-2xs'
                : 'bg-white border border-[#C7D8CF] text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Menunggu')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'Menunggu'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Menunggu ({reports.filter((r) => r.status === 'Menunggu Verifikasi').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Diproses')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'Diproses'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Diproses ({reports.filter((r) => r.status === 'Dalam Penanganan' || r.status === 'Diteruskan ke Pemerintah').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Selesai')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'Selesai'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Selesai ({reports.filter((r) => r.status === 'Selesai').length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Sesuai Page 8) */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor laporan, lokasi, atau jenis sampah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-[#C7D8CF] text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
          />
        </div>

        {/* Dropdown Status */}
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-white border border-[#C7D8CF] text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
          >
            <option value="">Semua Status</option>
            <option value="Selesai">Selesai</option>
            <option value="Diproses">Diproses</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table Container (Sesuai Page 8) */}
      <div className="bg-white rounded-2xl border border-[#C7D8CF]/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Memuat data laporan masuk...</div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            Tidak ada laporan yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#C7D8CF] text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nomor Laporan</th>
                  <th className="py-3 px-4">Jenis Sampah</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C7D8CF]/40 text-gray-700 font-medium">
                {filteredReports.map((r, i) => {
                  const num = i + 1
                  const code = r.report_number || `LPR-00${num}`
                  const jenis = r.categories?.name || 'Campuran'
                  const lokasi = r.address || 'Perum. Taman Sari Blok F5 No. 4'
                  const tanggal = formatDate(r.created_at)

                  return (
                    <tr key={r.id || i} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-gray-500">{num}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        <Link
                          to={`/admin/laporan/${r.id}`}
                          className="hover:text-[#064E46] hover:underline"
                        >
                          {code}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{jenis}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate">{lokasi}</td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{tanggal}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2]/70 text-red-700 border border-red-200 focus:outline-hidden cursor-pointer"
                        >
                          <option value="Selesai">Selesai</option>
                          <option value="Dalam Penanganan">Dalam Penanganan</option>
                          <option value="Diteruskan ke Pemerintah">Diteruskan</option>
                          <option value="Menunggu Verifikasi">Menunggu</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Link
                          to={`/admin/laporan/${r.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#DDF2E5] hover:bg-[#c2e7d4] text-[#064E46] text-xs font-bold transition-all shadow-2xs"
                        >
                          <span>Detail</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end pt-2">
        <button className="w-8 h-8 rounded-lg border border-[#C7D8CF] bg-white text-gray-600 flex items-center justify-center hover:bg-gray-50 shadow-2xs">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
