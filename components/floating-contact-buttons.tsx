"use client"

import { FaWhatsapp, FaPhone } from "react-icons/fa"
import { useEffect, useState } from "react"
import { getSettings } from "@/app/(dashboard)/settings/actions"
import { cn } from "@/lib/utils"

export function FloatingContactButtons({ isSidebarOpen = true }: { isSidebarOpen?: boolean }) {
    const [config, setConfig] = useState<{ whatsapp?: string, phone?: string } | null>(null)

    useEffect(() => {
        getSettings().then(settings => {
            setConfig({
                whatsapp: settings.whatsapp_number,
                phone: settings.contact_phone
            })
        })
    }, [])

    if (!config) return null
    if (!config.whatsapp && !config.phone) return null

    const { whatsapp: whatsappNumber, phone: phoneNumber } = config

    // Helper to format WhatsApp number (remove leading 0 if present to add country code, assumes Egypt +20)
    // If number starts with +, use as is. Ensure clean digits.
    const formatWhatsappLink = (num: string) => {
        if (!num) return '#'
        let clean = num.replace(/\D/g, '')
        if (clean.startsWith('20')) {
            return `https://wa.me/${clean}`
        }
        if (clean.startsWith('0')) {
            clean = clean.substring(1)
        }
        return `https://wa.me/20${clean}`
    }

    return (
        <>
            {/* WhatsApp Button - Right */}
            {whatsappNumber && (
                <a
                    href={formatWhatsappLink(whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "fixed bottom-6 z-[100] bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group animate-in slide-in-from-bottom-5",
                        // Mobile: always right-6
                        "right-6",
                        // Desktop: adjust based on sidebar
                        isSidebarOpen ? "md:right-72" : "md:right-24" // 72 is 18rem (16rem sidebar + 2rem margin), 24 is 6rem (4rem sidebar + 2rem margin)
                    )}
                    title="تواصل معنا عبر واتساب"
                >
                    {/* WhatsApp Logo */}
                    <FaWhatsapp className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                    <span className="sr-only">واتساب</span>

                    {/* Tooltip effect */}
                    <span className="absolute right-full mr-3 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        تواصل معنا
                    </span>
                </a>
            )}

            {/* Phone Button - Left */}
            {phoneNumber && (
                <a
                    href={`tel:${phoneNumber}`}
                    className="fixed bottom-6 left-6 z-[100] bg-[#3b82f6] hover:bg-[#2563eb] text-white p-3 md:p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center group animate-in slide-in-from-bottom-5 duration-500 delay-100"
                    title="اتصل بنا الآن"
                >
                    <FaPhone className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                    <span className="sr-only">اتصل بنا</span>

                    {/* Tooltip effect */}
                    <span className="absolute left-full ml-3 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        اتصل بنا
                    </span>
                </a>
            )}
        </>
    )
}
