import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Home from './pages/home'
import LaporSampah from './pages/laporsampah'
import Konfirmasi from './pages/konfirmasi'
import CekStatus from './pages/cekstatus'
import Jadwal from './pages/jadwal'
import { Panduan, FAQ, Tentang, Kontak } from './pages/informasi'
import Login from './pages/login'

// Admin RW Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import LaporanList from './pages/admin/LaporanList'
import LaporanDetail from './pages/admin/LaporanDetail'
import AdminJadwal from './pages/admin/AdminJadwal'

// Petugas Kebersihan Pages
import PetugasLayout from './pages/petugas/PetugasLayout'
import PetugasDashboard from './pages/petugas/Dashboard'
import JadwalManage from './pages/petugas/JadwalManage'

function App() {
  const location = useLocation()
  const isDashboardRoute =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/petugas')

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F4] text-[#2E2E2E]">
      {!isDashboardRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/lapor" element={<LaporSampah />} />
          <Route path="/konfirmasi" element={<Konfirmasi />} />
          <Route path="/cek-status" element={<CekStatus />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/panduan" element={<Panduan />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/login" element={<Login />} />

          {/* Admin RW Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin_rw']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="laporan" element={<LaporanList />} />
              <Route path="laporan/:id" element={<LaporanDetail />} />
              <Route path="jadwal" element={<AdminJadwal />} />
            </Route>
          </Route>

          {/* Petugas Kebersihan Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['petugas_kebersihan']} />}>
            <Route path="/petugas" element={<PetugasLayout />}>
              <Route index element={<PetugasDashboard />} />
              <Route path="dashboard" element={<PetugasDashboard />} />
              <Route path="jadwal" element={<JadwalManage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  )
}

export default App
