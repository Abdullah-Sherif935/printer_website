'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationBell } from "@/components/clients/notification-bell"
import { ClientSidebar } from '@/components/clients/client-sidebar'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export default function PortalMainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getUser() {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.push('/clients/login')
                return
            }

            setUser(user)

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(profileData)
            setLoading(false)

            // Force profile completion if profile doesn't exist OR phone/whatsapp missing
            // We specifically check for null profileData which happens on first login if trigger failed
            if (!profileData || !profileData.phone_number || !profileData.whatsapp_number) {
                console.log('Redirecting to complete profile', profileData)
                router.push('/clients/complete-profile')
            }
        }

        getUser()
    }, [router])

    if (loading) {
        return (
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange storageKey="portal-theme">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </ThemeProvider>
        )
    }

    if (!user) return null



    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            storageKey="portal-theme"
        >
            <div className="min-h-screen flex transition-colors duration-300">
                {/* Overlay for mobile when sidebar is open */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <ClientSidebar
                    profile={profile}
                    user={user}
                    sidebarOpen={sidebarOpen}
                    onToggle={setSidebarOpen}
                />

                {/* Main Content */}
                <div className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300",
                    // Desktop: shift content based on sidebar state
                    "md:mr-64",
                    !sidebarOpen && "md:mr-16",
                    // Mobile: full width always
                    "mr-0"
                )}>
                    {/* Top Header */}
                    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 md:px-6 h-16 flex items-center justify-between transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            {/* Hamburger for mobile */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden h-10 w-10"
                            >
                                <Menu className="w-6 h-6" />
                            </Button>

                            <Link href="/clients" className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-lg border border-border dark:border-white flex items-center justify-center bg-white">
                                    <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                    />
                                </div>
                                <span className="font-black text-lg">
                                    المهندس للطباعة
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <NotificationBell userId={user.id} />
                            <ThemeToggle />
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>

                    <footer className="bg-background border-t border-border p-4 text-center text-xs text-muted-foreground transition-colors duration-300">
                        &copy; {new Date().getFullYear()} المهندس للطباعة - جميع الحقوق محفوظة
                    </footer>
                </div>
            </div>
        </ThemeProvider>
    )
}
