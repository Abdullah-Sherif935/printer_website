import { getInventory } from "@/app/(dashboard)/inventory/actions"
import { getSettings } from "@/app/(dashboard)/settings/actions"
import { OrderCalculator } from "@/components/order-calculator"

export default async function NewOrderPage() {
    const inventory = await getInventory()
    const settings = await getSettings()

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">New Order Calculator</h1>
            <OrderCalculator inventory={inventory} settings={settings} />
        </div>
    )
}
