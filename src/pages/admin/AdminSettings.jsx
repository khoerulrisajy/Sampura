import React, { useState } from 'react'

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    appName: 'Sampura',
    version: 'v1.0.0',
    adminEmail: 'admin@sampura.id',
    lastUpdate: '12/September/2026',
  })

  const [notifications, setNotifications] = useState({
    newLaporan: true,
    laporanDiproses: true,
    laporanSelesai: true,
  })

  const [saved, setSaved] = useState(false)

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title & Subtitle (Sesuai Page 9) */}
      <div>
        <h1 className="text-2xl font-bold text-[#064E46] tracking-tight">Pengaturan</h1>
        <p className="text-xs text-gray-500 mt-1">
          Atur informasi sistem dan prefrensi notifikasi.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>Pengaturan berhasil disimpan!</span>
          <button onClick={() => setSaved(false)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#C7D8CF]/80 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Section 1: Informasi Sistem */}
        <div>
          <h2 className="text-xs font-bold text-gray-800 tracking-wide mb-4">
            Informasi Sistem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                Nama Aplikasi
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-gray-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                Versi
              </label>
              <input
                type="text"
                value={formData.version}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-gray-50/50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                Email Admin
              </label>
              <input
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-gray-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                Tanggal Terakhir Update
              </label>
              <input
                type="text"
                value={formData.lastUpdate}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-gray-50/50 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Notifikasi */}
        <div>
          <h2 className="text-xs font-bold text-gray-800 tracking-wide mb-3">
            Notifikasi
          </h2>
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <span className="text-xs font-medium text-gray-700">Notifikasi Laporan Baru</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.newLaporan}
                onClick={() => handleToggle('newLaporan')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.newLaporan ? 'bg-[#064E46]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.newLaporan ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <span className="text-xs font-medium text-gray-700">Notifikasi Laporan Diproses</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.laporanDiproses}
                onClick={() => handleToggle('laporanDiproses')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.laporanDiproses ? 'bg-[#064E46]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.laporanDiproses ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <span className="text-xs font-medium text-gray-700">Notifikasi Laporan Selesai</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.laporanSelesai}
                onClick={() => handleToggle('laporanSelesai')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.laporanSelesai ? 'bg-[#064E46]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.laporanSelesai ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button (Sesuai Page 9) */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#064E46] text-white font-medium text-xs sm:text-sm hover:bg-[#0B594E] shadow-sm transition-colors cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}
