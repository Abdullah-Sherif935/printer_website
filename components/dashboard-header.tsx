"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { InventoryNotifications } from "@/components/inventory-notifications"

export function DashboardHeader() {
    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/70 backdrop-blur-md px-4">
            <div className="flex items-center gap-2">
                <InventoryNotifications />
                <ThemeToggle />
            </div>

            <div className="flex-1" />

            <Separator orientation="vertical" className="ml-2 h-6" />
            <SidebarTrigger className="-mr-1" />
        </header>
    )
}
