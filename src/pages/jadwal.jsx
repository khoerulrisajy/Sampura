import React, { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, AlertCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function Jadwal() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSchedules = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('collection_schedules')
        .select('*')
        .eq('is_active', true)
        .order('area', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (err) {
      console.error('Error fetching schedules:', err)
      setError('Gagal memuat jadwal pengangkutan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#064E46]/10 text-[#064E46] text-xs font-semibold mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>Informasi Operasional</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2E2E2E]">
          Jadwal Pengangkutan Sampah
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Informasi waktu rutin petugas kebersihan mengangkut sampah di lingkungan RW 05 Batam Nirwana.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#064E46] mb-3" />
          <p className="text-sm">Memuat data jadwal pengangkutan...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 text-sm">
          {error}
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Belum Ada Jadwal Pengangkutan Aktif
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Petugas kebersihan belum menambahkan jadwal pengangkutan rutin. Silakan periksa kembali beberapa saat lagi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-xs hover:border-[#6BA24B]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#064E46] shrink-0" />
                  <h3 className="font-bold text-lg text-gray-900">{item.area}</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
                  Aktif
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-800">{item.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    {item.start_time?.slice(0, 5)} {item.end_time ? `- ${item.end_time?.slice(0, 5)} WIB` : 'WIB s/d Selesai'}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg mt-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
