'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, Home, User, Package, Star, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationBell } from "@/components/portal/notification-bell"
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
                router.push('/portal/login')
                return
            }

            setUser(user)

            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single()

            setProfile(profileData)
            setLoading(false)
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

    const menuItems = [
        { href: '/portal', icon: Home, label: 'الرئيسية' },
        { href: '/portal/profile', icon: User, label: 'الحساب الشخصي' },
        { href: '/portal/orders', icon: Package, label: 'طلباتي المسلمة' },
        { href: '/portal/reviews', icon: Star, label: 'التقييمات' },
    ]

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
                <aside className={cn(
                    "fixed top-0 right-0 h-screen bg-white dark:bg-zinc-900 border-l border-border z-50",
                    "transition-all duration-300 ease-in-out flex flex-col",
                    // Mobile: completely hide when collapsed
                    sidebarOpen ? "w-64 translate-x-0" : "w-0 translate-x-full overflow-hidden",
                    // Desktop: show icons when collapsed, full width when open
                    "md:translate-x-0 md:overflow-visible",
                    sidebarOpen ? "md:w-64" : "md:w-16"
                )}>
                    {/* Toggle Button */}
                    <div className="flex items-center justify-center h-16 px-4 border-b border-border">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="h-8 w-8 shrink-0"
                        >
                            {sidebarOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </Button>
                    </div>

                    {/* User Info */}
                    {sidebarOpen && (
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                                    {profile?.full_name?.charAt(0) || 'ع'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{profile?.full_name || 'عميل'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Avatar (Collapsed) */}
                    {!sidebarOpen && (
                        <div className="p-2 border-b border-border">
                            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {profile?.full_name?.charAt(0) || 'ع'}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full h-11 transition-all",
                                            sidebarOpen ? "justify-start gap-3 px-3" : "justify-center p-0",
                                            isActive && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-5 h-5 shrink-0",
                                            isActive && "text-blue-600 dark:text-blue-400"
                                        )} />
                                        {sidebarOpen && <span>{item.label}</span>}
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-2 border-t border-border">
                        <form action="/auth/signout" method="post" className="w-full">
                            <Button
                                type="submit"
                                variant="ghost"
                                className={cn(
                                    "w-full h-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",
                                    sidebarOpen ? "justify-start gap-3 px-3" : "justify-center p-0"
                                )}
                            >
                                <LogOut className="w-5 h-5 shrink-0" />
                                {sidebarOpen && <span>تسجيل الخروج</span>}
                            </Button>
                        </form>
                    </div>
                </aside>

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

                            <Link href="/portal" className="flex items-center gap-3">
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
