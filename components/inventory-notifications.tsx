"use client"

import { useEffect, useState } from "react"
import { Bell, AlertTriangle, Package, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

type LowStockItem = {
    id: string
    name: string
    quantity: number
    low_stock_threshold: number
    type: string
}

export function InventoryNotifications() {
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
    const [readIds, setReadIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Load read IDs from localStorage
        const savedRead = localStorage.getItem('read_notifications')
        if (savedRead) {
            try { setReadIds(JSON.parse(savedRead)) } catch (e) { }
        }

        fetchLowStockItems()
        const interval = setInterval(fetchLowStockItems, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    async function fetchLowStockItems() {
        try {
            const response = await fetch('/api/inventory/low-stock')
            if (response.ok) {
                const data = await response.json()
                setLowStockItems(data)
            }
        } catch (error) {
            console.error('Failed to fetch low stock items:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (open) {
            // Mark all current items as read when opened
            const currentIds = lowStockItems.map(i => i.id)
            const newReadIds = Array.from(new Set([...readIds, ...currentIds]))
            setReadIds(newReadIds)
            localStorage.setItem('read_notifications', JSON.stringify(newReadIds))
        }
    }

    // Unread count is items that are not in the readIds list
    const unreadCount = lowStockItems.filter(item => !readIds.includes(item.id)).length

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black rounded-full animate-bounce"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <DropdownMenuLabel className="flex items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/50">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-black text-sm">تنبيهات المخزون</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />

                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        جاري فحص المستودعات...
                    </div>
                ) : lowStockItems.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-bold text-emerald-600">كل شيء جاهز! المخزون كافٍ</p>
                    </div>
                ) : (
                    <div className="max-h-[350px] overflow-y-auto overflow-x-hidden">
                        {lowStockItems.map((item) => {
                            const isRead = readIds.includes(item.id)
                            return (
                                <DropdownMenuItem
                                    key={item.id}
                                    className={cn(
                                        "group flex items-start gap-3 p-4 border-b last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-100 dark:border-zinc-800 transition-colors cursor-pointer relative",
                                        !isRead && "bg-blue-50/10 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => router.push(`/inventory?search=${encodeURIComponent(item.name)}`)}
                                >
                                    <div className={cn(
                                        "mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                        isRead ? "bg-zinc-100 dark:bg-zinc-800" : "bg-amber-100 dark:bg-amber-900/30"
                                    )}>
                                        <AlertTriangle className={cn("h-4 w-4", isRead ? "text-zinc-400" : "text-amber-600")} />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className={cn(
                                            "font-black text-sm truncate group-hover:text-primary transition-colors",
                                            isRead ? "text-muted-foreground" : "text-zinc-800 dark:text-zinc-200"
                                        )}>
                                            {item.name}
                                        </p>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span>المتبقي:</span>
                                            <span className="font-bold text-zinc-900 dark:text-white">{item.quantity}</span>
                                            <span>وحدة</span>
                                            {!isRead && (
                                                <Badge variant="outline" className="text-[10px] py-0 px-1 border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-900/20">جديد</Badge>
                                            )}
                                        </div>
                                    </div>
                                    {!isRead && (
                                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                                    )}
                                </DropdownMenuItem>
                            )
                        })}
                    </div>
                )}

                <DropdownMenuSeparator className="m-0" />
                <Link href="/inventory" className="block p-3 text-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <span className="text-xs font-black text-primary uppercase tracking-wider">
                        إدارة المخزون الكامل
                    </span>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
