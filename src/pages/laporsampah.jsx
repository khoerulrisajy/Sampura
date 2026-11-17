import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Camera,
  AlertCircle,
  Send,
  Loader2,
  X,
  Map as MapIcon,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import MapPicker from '../components/MapPicker'

export default function LaporSampah() {
  const navigate = useNavigate()

  const [rtList, setRtList] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    description: '',
    rt_id: '',
    category_id: '',
    coordinates: { lat: 1.13014, lng: 104.05295 },
  })

  const [files, setFiles] = useState([])
  const [showMapModal, setShowMapModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [rtRes, catRes] = await Promise.all([
          supabase.from('rt_areas').select('*').order('rt_number'),
          supabase.from('categories').select('*').eq('is_active', true).order('name'),
        ])

        setRtList(rtRes.data || [])
        setCategories(catRes.data || [])

        if (rtRes.data?.length > 0) {
          setFormData((prev) => ({ ...prev, rt_id: rtRes.data[0].id }))
        }
        if (catRes.data?.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: catRes.data[0].id }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingInitial(false)
      }
    }
    fetchMaster()
  }, [])

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const validFiles = []
    for (const f of selected) {
      if (!f.type.startsWith('image/')) continue
      if (f.size > 5242880) continue
      validFiles.push(f)
    }

    const combined = [...files, ...validFiles].slice(0, 5)
    setFiles(combined)
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!formData.title.trim()) {
      setErrorMessage('Judul laporan wajib diisi.')
      return
    }
    if (!formData.address.trim()) {
      setErrorMessage('Lokasi / patokan alamat wajib diisi.')
      return
    }
    if (!formData.description.trim()) {
      setErrorMessage('Deskripsi laporan wajib diisi.')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Upload foto bukti ke Supabase Storage
      const uploadedUrls = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop() || 'jpg'
        const cleanName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${ext}`
        const filePath = `reports/${cleanName}`

        const { error: uploadErr } = await supabase.storage
          .from('report-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadErr) throw uploadErr

        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(urlData.publicUrl)
      }

      // 2. Submit RPC
      const defaultRtId = formData.rt_id || (rtList[0] && rtList[0].id)
      const defaultCatId = formData.category_id || (categories[0] && categories[0].id)

      const { data, error } = await supabase.rpc('submit_public_report', {
        p_rt_id: defaultRtId,
        p_category_id: defaultCatId,
        p_title: formData.title.trim(),
        p_description: formData.description.trim(),
        p_address: formData.address.trim(),
        p_latitude: formData.coordinates.lat,
        p_longitude: formData.coordinates.lng,
        p_reporter_name: null,
        p_reporter_phone: null,
        p_image_urls: uploadedUrls,
      })

      if (error) throw error

      navigate('/konfirmasi', {
        state: {
          reportNumber: data.report_number,
          accessCode: data.access_code,
          title: formData.title,
        },
      })
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Gagal mengirimkan laporan pengaduan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#DDF2E5]/50 min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Card (Sesuai Page 3 Top) */}
        <div className="bg-white rounded-3xl border border-[#C7D8CF]/70 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Gambar Truk & Petugas Kebersihan */}
          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1000&q=80"
              alt="Petugas Kebersihan Mengangkut Sampah"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden flex items-end p-6">
              <span className="text-white font-bold text-lg">Pelayanan Kebersihan RW 05</span>
            </div>
          </div>

          {/* Right Column: Form Lapor Sampah */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E46] tracking-tight">
                Lapor Sampah
              </h1>
              <p className="text-xs text-[#064E46]/75 mt-1 font-normal leading-relaxed">
                Isi data laporan dengan lengkap dan benar agar dapat segera ditindaklanjuti.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Judul Laporan */}
              <div>
                <label className="block text-xs font-bold text-[#064E46] mb-1.5">
                  Judul Laporan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Isi judul laporan yang sesuai"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#C7D8CF] text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                />
              </div>

              {/* Kategori Sampah & Wilayah RT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#064E46] mb-1.5">
                    Jenis Sampah
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#C7D8CF] text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] bg-white font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E46] mb-1.5">
                    Wilayah RT
                  </label>
                  <select
                    value={formData.rt_id}
                    onChange={(e) => setFormData({ ...formData, rt_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#C7D8CF] text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] bg-white font-medium"
                  >
                    {rtList.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.rt_number} - {rt.area_name || 'Batam Nirwana'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-xs font-bold text-[#064E46] mb-1.5">
                  Lokasi
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Cari lokasi atau pilih di peta"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-[#C7D8CF] text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="absolute right-2 p-1.5 text-[#064E46] hover:bg-[#DDF2E5] rounded-lg transition-colors cursor-pointer"
                    title="Buka Peta Interaktif"
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
                </div>
                {formData.coordinates && (
                  <span className="text-[10px] text-[#55766B] mt-1 block font-mono">
                    Koordinat Peta: {formData.coordinates.lat.toFixed(5)}, {formData.coordinates.lng.toFixed(5)}
                  </span>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-[#064E46] mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kondisi sampah yang anda temukan secara singkat dan jelas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#C7D8CF] text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                />
              </div>

              {/* Foto (opsional) */}
              <div>
                <label className="block text-xs font-bold text-[#064E46] mb-1.5">
                  Foto (opsional)
                </label>

                {/* Upload Area Dashed */}
                <div className="border border-dashed border-[#C7D8CF] rounded-2xl p-4 bg-[#F8FAF9] text-center">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#C7D8CF] flex items-center justify-center text-gray-400 mb-0.5">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#064E46]">Tambah foto</span>
                    <span className="text-[10px] text-gray-400">Klik untuk mengunggah (maks. 5 foto)</span>
                  </label>

                  {/* Thumbnail Row */}
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center pt-3 mt-3 border-t border-[#C7D8CF]/50">
                      {files.map((f, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={URL.createObjectURL(f)}
                            alt={`Preview ${i}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(i)}
                            className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white py-3 rounded-full font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Laporan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Peta Interaktif Leaflet */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 text-[#064E46]">
                <MapPin className="w-4 h-4" />
                <span>Pilih Titik Lokasi di Peta</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MapPicker
              value={formData.coordinates}
              onChange={(coords) => setFormData((prev) => ({ ...prev, coordinates: coords }))}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="bg-[#064E46] hover:bg-[#0B594E] text-white px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Gunakan Titik Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
