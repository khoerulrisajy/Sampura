import React from 'react'
import { Clock, XCircle, Send, PlayCircle, CheckCircle2 } from 'lucide-react'

export default function StatusBadge({ status, size = 'md' }) {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'Menunggu Verifikasi':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          icon: Clock,
          label: 'Menunggu Verifikasi',
        }
      case 'Ditolak':
        return {
          bg: 'bg-red-100 text-red-800 border-red-300',
          dot: 'bg-red-500',
          icon: XCircle,
          label: 'Ditolak',
        }
      case 'Diteruskan ke Pemerintah':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          dot: 'bg-blue-500',
          icon: Send,
          label: 'Diteruskan ke Pemerintah',
        }
      case 'Dalam Penanganan':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          dot: 'bg-purple-500',
          icon: PlayCircle,
          label: 'Dalam Penanganan',
        }
      case 'Selesai':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          icon: CheckCircle2,
          label: 'Selesai',
        }
      default:
        return {
          bg: 'bg-gray-100 text-gray-800 border-gray-300',
          dot: 'bg-gray-500',
          icon: Clock,
          label: st || 'Status Tidak Diketahui',
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-medium',
  }[size] || 'text-sm px-3 py-1 gap-2'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs ${config.bg} ${sizeClasses}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  )
}
