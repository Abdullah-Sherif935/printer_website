import { Suspense } from "react"
import { getActiveOrders } from "@/app/(dashboard)/active_orders/actions"
import { ActiveOrderList } from "@/components/active-orders/active-order-list"
import { Button } from "@/components/ui/button"
import { ListTodo, Plus, History } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function ActiveOrdersPage() {
    const orders = await getActiveOrders('pending')

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-3xl border border-emerald-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-200/50 transition-colors duration-500"></div>

                <div className="relative">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-3">
                        <ListTodo className="w-8 h-8 text-emerald-600" />
                        قائمة المهام اليومية
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">إدارة ومتابعة طلبات الطباعة قيد التنفيذ.</p>
                </div>

                <div className="relative flex gap-3 w-full md:w-auto">
                    <Link href="/active_orders/completed">
                        <Button variant="ghost" className="h-12 px-4 rounded-xl font-bold gap-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:text-gray-400 dark:hover:text-emerald-400 transition-all">
                            <History className="w-5 h-5" />
                            السجل
                        </Button>
                    </Link>

                    <Link href="/active_orders/new">
                        <Button className="h-12 px-6 rounded-xl font-black gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50 dark:shadow-none transition-all active:scale-95">
                            <Plus className="w-5 h-5" />
                            إضافة طلب جديد
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="pt-2">
                <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
                        ))}
                    </div>
                }>
                    <ActiveOrderList orders={orders} />
                </Suspense>
            </div>
        </div>
    )
}
