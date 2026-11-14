import React, { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  MapPin,
  Check,
  X,
  AlertCircle,
  Power,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function JadwalManage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [currentId, setCurrentId] = useState(null)

  const [formData, setFormData] = useState({
    area: '',
    day: 'Senin & Kamis',
    start_time: '08:00',
    end_time: '11:00',
    description: '',
    is_active: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSchedules = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const { data, error } = await supabase
        .from('collection_schedules')
        .select('*')
        .order('area', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (err) {
      console.error('Error fetching schedules:', err)
      setErrorMessage('Gagal memuat jadwal pengangkutan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleOpenAdd = () => {
    setModalMode('add')
    setCurrentId(null)
    setFormData({
      area: '',
      day: 'Senin & Kamis',
      start_time: '08:00',
      end_time: '11:00',
      description: '',
      is_active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item) => {
    setModalMode('edit')
    setCurrentId(item.id)
    setFormData({
      area: item.area,
      day: item.day,
      start_time: item.start_time?.slice(0, 5) || '08:00',
      end_time: item.end_time?.slice(0, 5) || '11:00',
      description: item.description || '',
      is_active: item.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const payload = {
        area: formData.area.trim(),
        day: formData.day.trim(),
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        description: formData.description.trim() || null,
        is_active: formData.is_active,
        updated_by: session?.user?.id || null,
      }

      if (modalMode === 'add') {
        const { error } = await supabase.from('collection_schedules').insert(payload)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('collection_schedules')
          .update(payload)
          .eq('id', currentId)
        if (error) throw error
      }

      setShowModal(false)
      fetchSchedules()
    } catch (err) {
      console.error('Submit schedule error:', err)
      alert(err.message || 'Gagal menyimpan jadwal pengangkutan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle Active/Inactive
  const handleToggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from('collection_schedules')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      setSchedules((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: !s.is_active } : s))
      )
    } catch (err) {
      console.error('Toggle error:', err)
      alert('Gagal mengubah status jadwal.')
    }
  }

  // Hapus Jadwal
  const handleDelete = async (id, area) => {
    if (!window.confirm(`Yakin ingin menghapus jadwal pengangkutan untuk wilayah "${area}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from('collection_schedules').delete().eq('id', id)
      if (error) throw error
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
      alert('Gagal menghapus jadwal.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Jadwal Pengangkutan</h1>
          <p className="text-sm text-gray-500">
            Atur hari, jam, dan wilayah operasional armada truk sampah RW 05 Batam Nirwana.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSchedules}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Jadwal Baru</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Memuat jadwal pengangkutan...
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-gray-500 text-sm">Belum ada jadwal yang terdaftar.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Jadwal Pertama</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Wilayah / Area</th>
                  <th className="py-3 px-4">Hari Operasi</th>
                  <th className="py-3 px-4">Jam Pengangkutan</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Status Aktif</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>{s.area}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {s.day}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {s.start_time?.slice(0, 5)} {s.end_time ? `- ${s.end_time?.slice(0, 5)} WIB` : 'WIB'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                      {s.description || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          s.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Klik untuk mengubah status aktif/nonaktif"
                      >
                        <Power className="w-3 h-3" />
                        <span>{s.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit jadwal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.area)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Jadwal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 text-blue-800">
                <Calendar className="w-5 h-5" />
                <span>{modalMode === 'add' ? 'Tambah Jadwal Pengangkutan' : 'Edit Jadwal Pengangkutan'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">
                  Area / Wilayah RT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RT 01 (Blok A) atau Seluruh RW 05"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">
                  Hari Pengangkutan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senin & Kamis atau Setiap Hari"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Jam Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-gray-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-700 mb-1">
                  Keterangan Operasional (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Truk kuning dinas kebersihan, sampah mohon ditaruh di depan pagar sebelum jam 08.00 WIB."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active_check"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-700 rounded border-gray-300 focus:ring-blue-700"
                />
                <label htmlFor="is_active_check" className="font-semibold text-gray-700 cursor-pointer">
                  Aktifkan jadwal ini (Tampilkan langsung ke publik warga)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{modalMode === 'add' ? 'Simpan Jadwal' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
