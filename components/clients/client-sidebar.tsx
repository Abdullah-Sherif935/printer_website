'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, Home, User, Package, Star, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ClientSidebarProps {
    profile: any
    user: any
    onToggle: (open: boolean) => void
    sidebarOpen: boolean
    className?: string
}

export function ClientSidebar({ profile, user, sidebarOpen, onToggle, className }: ClientSidebarProps) {
    const pathname = usePathname()

    const menuItems = [
        { href: '/clients', icon: Home, label: 'الرئيسية' },
        { href: '/clients/profile', icon: User, label: 'الحساب الشخصي' },
        { href: '/clients/orders', icon: Package, label: 'طلباتي المسلمة' },
        { href: '/clients/reviews', icon: Star, label: 'التقييمات' },
    ]

    return (
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
                    onClick={() => onToggle(!sidebarOpen)}
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
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
                        <Link key={item.href} href={item.href} prefetch={true}>
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
    )
}
