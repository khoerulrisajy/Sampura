import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation } from 'lucide-react'

// Custom Pin Icon bertema Sampura (Hijau Tua dengan border putih & bayangan)
const sampuraPinIcon = L.divIcon({
  className: 'sampura-map-marker',
  html: `
    <div style="
      background-color: #064E46;
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #FFFFFF;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
})

// Sub-komponen untuk menangkap event klik pada peta
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition({
        lat: Number(e.latlng.lat.toFixed(7)),
        lng: Number(e.latlng.lng.toFixed(7)),
      })
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : (
    <Marker
      position={[position.lat, position.lng]}
      icon={sampuraPinIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const latlng = marker.getLatLng()
          setPosition({
            lat: Number(latlng.lat.toFixed(7)),
            lng: Number(latlng.lng.toFixed(7)),
          })
        },
      }}
    />
  )
}

export default function MapPicker({ value, onChange }) {
  // Titik koordinat default: Batam Nirwana / Batam Center (1.13014, 104.05295)
  const defaultPos = { lat: 1.13014, lng: 104.05295 }
  const [position, setPosition] = useState(value || defaultPos)

  useEffect(() => {
    if (value && (value.lat !== position.lat || value.lng !== position.lng)) {
      setPosition(value)
    }
  }, [value])

  const handlePositionChange = (newPos) => {
    setPosition(newPos)
    if (onChange) {
      onChange(newPos)
    }
  }

  // Tombol ambil lokasi GPS saat ini dari browser
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = {
            lat: Number(pos.coords.latitude.toFixed(7)),
            lng: Number(pos.coords.longitude.toFixed(7)),
          }
          handlePositionChange(userPos)
        },
        (err) => {
          console.warn('Gagal mengambil GPS browser:', err)
          alert('Tidak dapat mendeteksi lokasi GPS Anda. Silakan klik langsung pada peta.')
        },
        { enableHighAccuracy: true }
      )
    } else {
      alert('Browser Anda tidak mendukung deteksi lokasi otomatis.')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
          Titik Koordinat Lokasi Sampah <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-1.5 text-xs text-[#2C6705] hover:text-[#235204] font-medium bg-[#2C6705]/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Gunakan Lokasi Saya Saat Ini</span>
        </button>
      </div>

      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-gray-300 shadow-inner z-0">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#2C6705]" />
          <span>Klik peta atau geser pin merah untuk menandai lokasi persis tumpukan sampah.</span>
        </div>
        <span className="font-mono text-gray-700 font-medium">
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </span>
      </div>
    </div>
  )
}
