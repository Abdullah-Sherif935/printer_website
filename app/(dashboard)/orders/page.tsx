import { getOrders } from "./actions-v2"
import { SalesDisplay } from "./sales-display"

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="flex-1 space-y-6 bg-muted/20 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-800 dark:text-zinc-100">سجل المبيعات والمديونيات</h2>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">عرض جميع العمليات المسجلة وتحصيل الديون المتبقية.</p>
                </div>
            </div>

            <SalesDisplay initialOrders={orders} />
        </div>
    )
}
