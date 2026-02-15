'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// We will use a dynamic import for the entire map component to avoid SSR issues with Leaflet
const MapContent = dynamic(() => import('./map-content'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[300px] md:h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-slate-600 dark:text-slate-400">جاري تحميل الخريطة...</p>
            </div>
        </div>
    )
})

interface InteractiveMapProps {
    center: { lat: number; lng: number }
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
    searchQuery?: string
}

export function InteractiveMap(props: InteractiveMapProps) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null

    return <MapContent {...props} />
}
