import { getInventory } from "@/app/(dashboard)/inventory/actions"
import { getSettings } from "@/app/(dashboard)/settings/actions"
import { getCustomers } from "@/app/(dashboard)/customers/actions"
import { OrderCalculator } from "@/components/order-calculator-v2"

export default async function NewOrderPage() {
    const [inventory, settings, customers] = await Promise.all([
        getInventory(),
        getSettings(),
        getCustomers()
    ])

    return (
        <div className="flex-1 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-800">تسجيل المبيعات اليومية</h2>
            <OrderCalculator inventory={inventory} settings={settings} customers={customers} />
        </div>
    )
}
