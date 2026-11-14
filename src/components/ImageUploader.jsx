import React, { useRef } from 'react'
import { Camera, X, UploadCloud, AlertCircle } from 'lucide-react'

export default function ImageUploader({ files = [], onChange }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (!selectedFiles.length) return

    const validFiles = []
    let hasOversized = false

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} bukan format gambar yang valid.`)
        continue
      }
      // Batas 5MB (5 * 1024 * 1024 bytes)
      if (file.size > 5242880) {
        hasOversized = true
        continue
      }
      validFiles.push(file)
    }

    if (hasOversized) {
      alert('Beberapa gambar diabaikan karena ukurannya melebihi batas maksimal 5MB.')
    }

    const combined = [...files, ...validFiles]
    if (combined.length > 5) {
      alert('Maksimal hanya dapat mengunggah 5 foto bukti.')
      onChange(combined.slice(0, 5))
    } else {
      onChange(combined)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index) => {
    const updated = files.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
          Foto Bukti Sampah <span className="text-gray-400 font-normal">(Opsional, Maks 5 Foto)</span>
        </label>
        <span className="text-xs text-gray-500 font-medium">
          {files.length}/5 foto
        </span>
      </div>

      {/* Grid Thumbnail Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {files.map((file, idx) => {
          const previewUrl = URL.createObjectURL(file)
          return (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-300 bg-gray-100 group shadow-2xs"
            >
              <img
                src={previewUrl}
                alt={`Bukti ${idx + 1}`}
                className="w-full h-full object-cover"
                onLoad={() => URL.revokeObjectURL(previewUrl)}
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Hapus foto ini"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                Foto {idx + 1}
              </span>
            </div>
          )
        })}

        {/* Upload Trigger Button */}
        {files.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 hover:border-[#2C6705] hover:bg-[#2C6705]/5 rounded-xl flex flex-col items-center justify-center p-3 text-gray-500 hover:text-[#2C6705] transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-[#2C6705]/10 flex items-center justify-center mb-1 text-gray-500 group-hover:text-[#2C6705] transition-colors">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-center">Tambah Foto</span>
            <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Camera className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>Unggah foto kondisi sampah di lokasi agar mempermudah verifikasi Admin RW.</span>
      </div>
    </div>
  )
}
