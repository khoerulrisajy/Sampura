import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, LogIn, AlertCircle, UserPlus, Shield, User, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('admin_rw')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      // Ambil data profil akun
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileErr || !profile) {
        throw new Error('Akun Anda belum memiliki role di sistem. Silakan daftarkan profil pengelola terlebih dahulu.')
      }

      if (profile.role === 'admin_rw') {
        navigate('/admin/dashboard')
      } else if (profile.role === 'petugas_kebersihan') {
        navigate('/petugas/dashboard')
      } else {
        throw new Error('Role akun tidak dikenali.')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (!fullName.trim()) {
        throw new Error('Nama lengkap wajib diisi.')
      }

      // 1. Daftarkan akun di Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (authError) throw authError

      if (!data.user) {
        throw new Error('Pendaftaran gagal. Periksa kembali data Anda.')
      }

      // 2. Simpan profil ke tabel profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          role: role,
        })

      if (profileError) {
        console.warn('Upsert profile error:', profileError)
      }

      setSuccessMsg('Akun pengelola berhasil dibuat! Silakan masuk menggunakan akun baru Anda.')
      setActiveTab('login')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Pendaftaran akun gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-200/90 p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#064E46]/10 rounded-2xl flex items-center justify-center mx-auto text-[#064E46]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Portal Pengelola</h2>
          <p className="text-xs text-gray-500">
            Khusus Admin RW dan Petugas Kebersihan RW 05 Batam Nirwana
          </p>
        </div>

        {/* Tab Toggle Login / Register */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setErrorMsg(null)
            }}
            className={`w-1/2 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-gray-900 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register')
              setErrorMsg(null)
            }}
            className={`w-1/2 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* Form Login */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Pengelola
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sampura.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white py-3 rounded-xl font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
            </button>
          </form>
        ) : (
          /* Form Register Pengelola */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Peran Akun (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-xs bg-white font-medium"
              >
                <option value="admin_rw">Admin RW (Verifikasi Laporan & WhatsApp)</option>
                <option value="petugas_kebersihan">Petugas Kebersihan (Kelola Jadwal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sampura.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Kata Sandi (Min. 6 Karakter)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#064E46] text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#064E46] hover:bg-[#0B594E] text-white py-3 rounded-xl font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Pengelola'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
