import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  MapPin,
  Camera,
  AlertCircle,
  Send,
  Loader2,
  Check,
  User,
  Phone,
  Tag,
  AlignLeft,
  Home,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import MapPicker from '../components/MapPicker'
import ImageUploader from '../components/ImageUploader'

export default function LaporSampah() {
  const navigate = useNavigate()

  // Form State
  const [rtList, setRtList] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)

  const [formData, setFormData] = useState({
    reporter_name: '',
    reporter_phone: '',
    rt_id: '',
    category_id: '',
    title: '',
    description: '',
    address: '',
    coordinates: { lat: 1.13014, lng: 104.05295 },
  })

  const [files, setFiles] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Ambil data RT dan Kategori dari Supabase
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [rtRes, catRes] = await Promise.all([
          supabase.from('rt_areas').select('*').order('rt_number', { ascending: true }),
          supabase.from('categories').select('*').eq('is_active', true).order('name', { ascending: true }),
        ])

        if (rtRes.error) throw rtRes.error
        if (catRes.error) throw catRes.error

        setRtList(rtRes.data || [])
        setCategories(catRes.data || [])

        // Set default RT dan Kategori pertama jika ada
        if (rtRes.data?.length > 0) {
          setFormData((prev) => ({ ...prev, rt_id: rtRes.data[0].id }))
        }
        if (catRes.data?.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: catRes.data[0].id }))
        }
      } catch (err) {
        console.error('Error fetching master data:', err)
        setErrorMessage('Gagal memuat data master wilayah dan kategori dari database.')
      } finally {
        setLoadingInitial(false)
      }
    }

    fetchMasterData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePreSubmit = (e) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validasi field wajib
    if (!formData.rt_id) {
      setErrorMessage('Pilih wilayah RT lokasi sampah.')
      return
    }
    if (!formData.category_id) {
      setErrorMessage('Pilih kategori permasalahan sampah.')
      return
    }
    if (!formData.title.trim()) {
      setErrorMessage('Judul laporan wajib diisi.')
      return
    }
    if (!formData.description.trim()) {
      setErrorMessage('Deskripsi laporan wajib diisi.')
      return
    }
    if (!formData.address.trim()) {
      setErrorMessage('Patokan alamat lokasi wajib diisi.')
      return
    }

    // Buka modal konfirmasi ringkasan
    setShowConfirmModal(true)
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // 1. Upload foto bukti ke Supabase Storage (jika ada)
      const uploadedUrls = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop() || 'jpg'
        const cleanName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${ext}`
        const filePath = `reports/${cleanName}`

        const { error: uploadErr } = await supabase.storage
          .from('report-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadErr) {
          console.error('Upload foto error:', uploadErr)
          throw new Error(`Gagal mengunggah foto ${file.name}. Pastikan file gambar di bawah 5MB.`)
        }

        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(urlData.publicUrl)
      }

      // 2. Panggil RPC submit_public_report
      const { data, error } = await supabase.rpc('submit_public_report', {
        p_rt_id: formData.rt_id,
        p_category_id: formData.category_id,
        p_title: formData.title.trim(),
        p_description: formData.description.trim(),
        p_address: formData.address.trim(),
        p_latitude: formData.coordinates.lat,
        p_longitude: formData.coordinates.lng,
        p_reporter_name: formData.reporter_name.trim() || null,
        p_reporter_phone: formData.reporter_phone.trim() || null,
        p_image_urls: uploadedUrls,
      })

      if (error) {
        console.error('RPC Error:', error)
        throw error
      }

      // 3. Sukses -> Arahkan ke halaman konfirmasi
      navigate('/konfirmasi', {
        state: {
          reportNumber: data.report_number,
          accessCode: data.access_code,
          title: formData.title,
        },
      })
    } catch (err) {
      console.error('Submit error:', err)
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengirimkan laporan.')
      setShowConfirmModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRt = rtList.find((r) => r.id === formData.rt_id)
  const selectedCat = categories.find((c) => c.id === formData.category_id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Form */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#064E46]/10 text-[#064E46] text-xs font-semibold mb-3">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Pengaduan Publik Tanpa Login</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2E2E2E]">
          Formulir Pengaduan Sampah
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Laporkan masalah sampah di lingkungan RW 05 Batam Nirwana. Laporan Anda akan diperiksa dan ditindaklanjuti oleh Admin RW.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loadingInitial ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#064E46] mx-auto mb-3" />
          <p className="text-sm">Menyiapkan data wilayah dan formulir...</p>
        </div>
      ) : (
        <form onSubmit={handlePreSubmit} className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-8">
          {/* Section 1: Data Pelapor (Opsional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-[#064E46]" />
              <span>Identitas Pelapor (Opsional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama Anda
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="reporter_name"
                    value={formData.reporter_name}
                    onChange={handleChange}
                    placeholder="Boleh dikosongkan (anonim)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nomor WhatsApp / Telepon
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="reporter_phone"
                    value={formData.reporter_phone}
                    onChange={handleChange}
                    placeholder="Contoh: 08123456789"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Identitas ini hanya dapat dilihat oleh Admin RW untuk keperluan konfirmasi jika diperlukan.
            </p>
          </div>

          {/* Section 2: Informasi Masalah Sampah */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#064E46]" />
              <span>Detail Permasalahan Sampah</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Wilayah RT Lokasi <span className="text-red-500">*</span>
                </label>
                <select
                  name="rt_id"
                  value={formData.rt_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm bg-white"
                >
                  {rtList.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.rt_number} ({rt.area_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Kategori Sampah <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Tumpukan sampah basah di depan pos satpam Blok B"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Deskripsi Lengkap Kondisi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan kondisi tumpukan sampah, perkiraan volume, bau yang ditimbulkan, atau sudah berapa hari belum diangkut..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm"
              />
            </div>
          </div>

          {/* Section 3: Lokasi & Peta */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#064E46]" />
              <span>Lokasi & Titik Koordinat</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Patokan Alamat Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Contoh: Depan Musholla Blok B No. 12 atau pertigaan jalan utama RT 02"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-sm"
              />
            </div>

            <MapPicker
              value={formData.coordinates}
              onChange={(coords) => setFormData((prev) => ({ ...prev, coordinates: coords }))}
            />
          </div>

          {/* Section 4: Foto Bukti */}
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <ImageUploader files={files} onChange={setFiles} />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pengaduan Sampah</span>
            </button>
          </div>
        </form>
      )}

      {/* Modal Konfirmasi Ringkasan Laporan */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-[#064E46] rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Konfirmasi Kirim Pengaduan</h3>
              <p className="text-xs text-gray-500">
                Pastikan data yang Anda masukkan sudah benar sebelum dikirim ke Admin RW.
              </p>
            </div>

            <div className="bg-[#F8F9F4] rounded-xl p-4 text-xs space-y-2 border border-gray-200">
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Wilayah RT:</span>
                <span className="font-semibold text-gray-900">{selectedRt?.rt_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Kategori:</span>
                <span className="font-semibold text-gray-900">{selectedCat?.name}</span>
              </div>
              <div className="py-1 border-b border-gray-200/60">
                <span className="text-gray-500 block mb-0.5">Judul:</span>
                <span className="font-semibold text-gray-900">{formData.title}</span>
              </div>
              <div className="py-1 border-b border-gray-200/60">
                <span className="text-gray-500 block mb-0.5">Patokan Alamat:</span>
                <span className="font-medium text-gray-800">{formData.address}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Foto Bukti Terlampir:</span>
                <span className="font-semibold text-[#064E46]">{files.length} Foto</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cek Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-1/2 py-3 rounded-xl bg-[#064E46] hover:bg-[#0B594E] text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Ya, Kirim Laporan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
