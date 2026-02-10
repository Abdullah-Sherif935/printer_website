import { getActiveOrders } from "@/app/(dashboard)/active_orders/actions"
import { ActiveOrderList } from "@/components/active-orders/active-order-list"
import { Button } from "@/components/ui/button"
import { ArrowRight, History } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function CompletedActiveOrdersPage() {
    const orders = await getActiveOrders('completed')

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-gray-400" />
                        سجل المهام المنجزة
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">أرشيف الطلبات التي تم الانتهاء منها</p>
                </div>

                <Link href="/active_orders">
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-bold gap-2 border-gray-200 hover:bg-white hover:text-emerald-600 transition-all dark:border-zinc-700 dark:hover:bg-zinc-800">
                        <ArrowRight className="w-4 h-4" />
                        العودة للمهام الحالية
                    </Button>
                </Link>
            </div>

            <ActiveOrderList orders={orders} isCompleted={true} />
        </div>
    )
}
