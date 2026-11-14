import React, { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, RefreshCw, AlertCircle, Info } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminJadwal() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('collection_schedules')
        .select(`
          *,
          profiles:updated_by (full_name)
        `)
        .order('area', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (err) {
      console.error('Error fetching admin schedules:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Pengangkutan Sampah</h1>
          <p className="text-sm text-gray-500">
            Daftar jadwal operasional pengangkutan rutin yang dikelola oleh Petugas Kebersihan.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSchedules}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-blue-800">
        <Info className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          Sesuai aturan sistem, hak akses menambah atau mengubah jadwal pengangkutan dipegang oleh role <strong>Petugas Kebersihan</strong>. Admin RW memiliki akses lihat untuk koordinasi pengaduan.
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Memuat daftar jadwal pengangkutan...
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Belum ada jadwal yang ditambahkan oleh petugas kebersihan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Area / Wilayah</th>
                  <th className="py-3 px-4">Hari Operasional</th>
                  <th className="py-3 px-4">Jam Pengangkutan</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2C6705] shrink-0" />
                      <span>{s.area}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {s.day}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {s.start_time?.slice(0, 5)} {s.end_time ? `- ${s.end_time?.slice(0, 5)} WIB` : 'WIB s/d Selesai'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                      {s.description || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
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
