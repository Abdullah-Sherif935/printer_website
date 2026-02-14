import { getInventory } from "@/app/(dashboard)/inventory/actions"
import { getSettings } from "@/app/(dashboard)/settings/actions"
import { getCustomers } from "@/app/(dashboard)/customers/actions"
import { OrderCalculator } from "@/components/order-calculator-v2"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default async function NewOrderPage() {
    const [inventory, settings, customers] = await Promise.all([
        getInventory(),
        getSettings(),
        getCustomers()
    ])

    return (
        <div className="flex-1 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-800">تسجيل المبيعات اليومية</h2>
            <Suspense fallback={<div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
                <OrderCalculator inventory={inventory} settings={settings} customers={customers} />
            </Suspense>
        </div>
    )
}
