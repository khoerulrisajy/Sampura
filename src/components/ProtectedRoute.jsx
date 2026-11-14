import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ allowedRoles = ['admin_rw'] }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setAuthorized(false)
          setLoading(false)
          return
        }

        // Ambil role akun dari profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error || !data) {
          console.warn('Profil user tidak ditemukan:', error)
          setAuthorized(false)
        } else if (allowedRoles.includes(data.role)) {
          setProfile(data)
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch (err) {
        console.error('Auth verification error:', err)
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [allowedRoles])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#2C6705] mb-3" />
        <p className="text-sm">Memverifikasi hak akses pengelola...</p>
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/login" replace />
  }

  return <Outlet context={{ profile }} />
}
