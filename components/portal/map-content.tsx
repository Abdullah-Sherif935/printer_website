'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { toast } from 'sonner'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapContentProps {
    center: { lat: number; lng: number }
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
    searchQuery?: string
}

// Separate component for map events like clicks
function MapEvents({ onLocationSelect, setMarkerPosition }: any) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng
            setMarkerPosition([lat, lng])
            reverseGeocode(lat, lng, onLocationSelect)
        },
    })
    return null
}

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom())
        }
    }, [center, map])
    return null
}

async function reverseGeocode(lat: number, lng: number, onLocationSelect: any) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`)
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        onLocationSelect({ lat, lng, address })
    } catch (error) {
        onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` })
    }
}

export default function MapContent({ center, onLocationSelect, searchQuery }: MapContentProps) {
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)
    const [mapCenter, setMapCenter] = useState<[number, number]>([center.lat, center.lng])

    // Update map center when props change
    useEffect(() => {
        setMapCenter([center.lat, center.lng])
    }, [center])

    useEffect(() => {
        if (!searchQuery) return

        const performSearch = async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=ar&limit=1`)
                const data = await response.json()
                if (data && data.length > 0) {
                    const { lat, lon, display_name } = data[0]
                    const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)]
                    setMapCenter(newPos)
                    setMarkerPosition(newPos)
                    onLocationSelect({ lat: newPos[0], lng: newPos[1], address: display_name })
                    toast.success('تم العثور على المكان!')
                } else {
                    toast.error('لم يتم العثور على نتائج للبحث')
                }
            } catch (error) {
                console.error('Search error:', error)
                toast.error('حدث خطأ أثناء البحث')
            }
        }

        performSearch()
    }, [searchQuery])

    return (
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 z-0">
            <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents onLocationSelect={onLocationSelect} setMarkerPosition={setMarkerPosition} />
                <ChangeView center={mapCenter} />
                {markerPosition && (
                    <Marker
                        position={markerPosition}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                const marker = e.target
                                const position = marker.getLatLng()
                                setMarkerPosition([position.lat, position.lng])
                                reverseGeocode(position.lat, position.lng, onLocationSelect)
                            }
                        }}
                    />
                )}
            </MapContainer>
        </div>
    )
}
