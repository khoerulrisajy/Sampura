import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      // Ambil role akun dari profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin_rw') {
        navigate('/admin/laporan')
      } else if (profile?.role === 'petugas_kebersihan') {
        navigate('/petugas/dashboard')
      } else {
        navigate('/admin/laporan')
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) throw error

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim() || 'Admin Sampura',
          role: 'admin_rw',
        })
      }

      setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan akun Anda.')
      setIsRegisterMode(false)
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Pendaftaran gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#DDF2E5]/50 min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl border border-[#C7D8CF]/70 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Brand Illustration (Sesuai Page 7) */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#E7F6ED] to-[#DDF2E5] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[260px] md:min-h-[460px]">
          {/* Subtle nature circles background */}
          <div className="w-48 h-48 rounded-full bg-[#BFE0CE]/30 absolute -bottom-10 -left-10 blur-xl pointer-events-none"></div>
          <div className="w-48 h-48 rounded-full bg-[#BFE0CE]/30 absolute -top-10 -right-10 blur-xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            {/* Truck Icon */}
            <div className="text-[#064E46] flex items-center justify-center mb-1">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 32 32"
              >
                <rect height="15" rx="2" width="17" x="2" y="7"></rect>
                <path d="M19 12h5.5l3.5 4v6h-9"></path>
                <circle cx="8" cy="24" r="2.5"></circle>
                <circle cx="23" cy="24" r="2.5"></circle>
                <path
                  d="M10 13c1.5 0 3-1 3-2.5s-1.5-2.5-3-2.5c0 1.5 1 3 2.5 3z"
                  fill="currentColor"
                  opacity="0.85"
                  stroke="none"
                ></path>
              </svg>
            </div>

            <span className="text-3xl font-extrabold tracking-tight text-[#064E46] block">
              sampura<span className="text-[#176B50]">.</span>
            </span>

            <p className="text-xs text-[#064E46]/80 font-medium tracking-wide">
              Lapor • Pantau • Jaga
            </p>
          </div>
        </div>

        {/* Right Side: Form (Sesuai Page 7) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#064E46] tracking-tight">
              {isRegisterMode ? 'Daftar Akun Pengelola' : 'Selamat Datang Kembali'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isRegisterMode
                ? 'Lengkapi data untuk mendaftarkan akun pengelola baru.'
                : 'Masuk untuk melanjutkan ke akun anda.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-[#064E46] mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                />
              </div>
            )}

            {/* Email Input */}
            <div>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Email atau nomor telepon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 rounded-full border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#064E46]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {!isRegisterMode && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#064E46] rounded border-gray-300 focus:ring-[#064E46]"
                  />
                  <span>Ingatkan saya</span>
                </label>
                <a href="#" className="text-gray-500 hover:text-[#064E46] text-xs">
                  Lupa Password?
                </a>
              </div>
            )}

            {/* Submit Button (Sesuai Page 7) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#064E46] hover:bg-[#0B594E] text-white py-3 rounded-full font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isRegisterMode ? 'Daftar' : 'Masuk'}
              </button>
            </div>

            {/* Divider 'atau' */}
            <div className="relative py-1 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] text-gray-400">atau</span>
            </div>

            {/* Toggle Button (Sesuai Page 7) */}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode)
                setErrorMsg(null)
              }}
              className="w-full border border-[#064E46] text-[#064E46] hover:bg-[#DDF2E5]/50 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer"
            >
              {isRegisterMode ? 'Sudah Punya Akun? Masuk' : 'Daftar Akun'}
            </button>
          </form>
        </div>
      </div>

      <p className="text-[11px] text-[#55766B] text-center mt-6">
        © 2025 Sampura Batam. Platform Pelaporan & Pengelolaan Sampah Digital.
      </p>
    </div>
  )
}
