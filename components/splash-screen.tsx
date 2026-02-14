"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function SplashScreen() {
    const [show, setShow] = useState(true)
    const [isVisible, setIsVisible] = useState(true)
    const [startAnimation, setStartAnimation] = useState(false)

    useEffect(() => {
        // Start animation immediately after mount
        const animTimer = setTimeout(() => setStartAnimation(true), 100)

        // Total splash duration: 2 seconds
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => setShow(false), 500)
        }, 2000)

        return () => {
            clearTimeout(timer)
            clearTimeout(animTimer)
        }
    }, [])

    if (!show) return null

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="relative flex flex-col items-center justify-center p-8">
                {/* Logo Container with "Drawing/Wipe" Animation */}
                {/* We use a mask wrapper that expands width from 0 to 100% */}
                <div
                    className="relative w-64 h-64 overflow-hidden transition-[width] duration-1500 ease-in-out will-change-[width]"
                    style={{ width: startAnimation ? '16rem' : '0px' }}
                >
                    {/* Inner container fixed width to prevent squashing */}
                    <div className="w-64 h-64 flex items-center justify-center">
                        <Image
                            src="/loader-logo-user.png"
                            alt="Loading Application"
                            width={256}
                            height={256}
                            className="object-contain
                                mix-blend-multiply opacity-90 dark:opacity-100
                                dark:invert dark:mix-blend-screen
                                drop-shadow-xl"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
