"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

interface Notification {
    id: string
    title: string
    message: string
    is_read: boolean
    created_at: string
    link?: string
}

export function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const panelRef = useRef<HTMLDivElement>(null)

    // Fetch notifications
    async function fetchNotifications() {
        const supabase = createClient()
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter((n: Notification) => !n.is_read).length)
        }
    }

    // Mark single notification as read
    async function markAsRead(notificationId: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)

        if (error) {
            console.error('Error marking notification as read:', error)
            return // Don't update local state if DB update failed
        }

        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Mark all as read
    async function markAllAsRead() {
        const supabase = createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) {
            console.error('Error marking all notifications as read:', error)
            return
        }

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    // Close panel when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Initial fetch + auto-refresh every 30 seconds
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [userId])

    // Subscribe to real-time notifications
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-amber-600 animate-bounce' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 z-50 overflow-hidden"
                    style={{ maxHeight: '70vh' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 border-b border-gray-100 dark:border-zinc-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            الإشعارات
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} جديد</span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                            >
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Bell className="w-8 h-8 mb-2 opacity-30" />
                                <p className="text-sm">لا توجد إشعارات</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-gray-50 dark:border-zinc-800 last:border-0 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10 border-r-4 border-r-blue-500' : ''}`}
                                    onClick={() => {
                                        if (!notification.is_read) markAsRead(notification.id)
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ar })}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
