"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { InventoryNotifications } from "@/components/inventory-notifications"

export function DashboardUtilities() {
    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-xl border shadow-lg">
            <InventoryNotifications />
            <ThemeToggle />
        </div>
    )
}
