"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Phone, MessageCircle, Clock, CheckCircle2 } from "lucide-react"
import { markActiveOrderCompleted } from "@/app/(dashboard)/active_orders/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ActiveOrderList({ orders, isCompleted = false }: { orders: any[], isCompleted?: boolean }) {
    const router = useRouter()

    async function handleComplete(order: any) {
        toast.promise(
            async () => {
                await markActiveOrderCompleted(order.id) // First, mark as completed in DB

                // Prepare data for POS redirection
                const params = new URLSearchParams()
                params.set('source', 'active_orders')
                if (order.customer_name) params.set('customerName', order.customer_name)
                if (order.customer_phone) params.set('customerPhone', order.customer_phone)

                // Pass items data lightly
                if (order.items) {
                    // Simple transformation to minimize URL length, though not strictly necessary for local
                    const simpleItems = order.items.map((i: any) => ({
                        q: i.quantity,
                        p: i.paperCount,
                        d: i.detail
                    }))
                    params.set('items', JSON.stringify(simpleItems))
                }

                router.push(`/orders/new?${params.toString()}`)
                router.refresh()
            }, {
            loading: 'جاري تحديث الحالة والنقل...',
            success: 'تم الإنجاز! جاري فتح شاشة البيع...',
            error: 'حدث خطأ أثناء التحديث'
        })
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <div className="w-20 h-20 bg-emerald-100/50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600/50" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">لا توجد طلبات معلقة</h3>
                <p className="text-gray-500 mt-2 text-sm">أنت رائع! تم إنجاز العمل كله.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
                <Card key={order.id} className="relative group overflow-hidden border-2 border-transparent hover:border-emerald-500/20 transition-all duration-300 shadow-sm hover:shadow-lg bg-white dark:bg-zinc-900 rounded-2xl">
                    <div className={`absolute top-0 left-0 w-1 h-full rounded-l-md ${isCompleted ? "bg-gray-300 dark:bg-zinc-700" : "bg-emerald-500"}`} />

                    <CardHeader className="pb-3 pt-5 px-5 flex flex-row justify-between items-start gap-2">
                        <div>
                            <CardTitle className="text-lg font-black text-gray-800 dark:text-gray-100 line-clamp-1">
                                {order.customer_name}
                            </CardTitle>
                            <a
                                href={`https://wa.me/20${order.customer_phone?.replace(/^0+/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mt-2 transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                {order.customer_phone}
                            </a>
                        </div>
                        <Badge variant="outline" className={`font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 ${isCompleted || order.status === 'completed'
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                            }`}>
                            {isCompleted || order.status === 'completed' ? (
                                <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    مكتمل
                                </>
                            ) : (
                                <>
                                    <Clock className="w-3 h-3" />
                                    انتظار
                                </>
                            )}
                        </Badge>
                    </CardHeader>

                    <CardContent className="px-5 pb-4">
                        <div className="space-y-2 mb-4">
                            {order.items && Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                                    <span className="font-medium text-gray-700 dark:text-zinc-300 truncate max-w-[180px] flex items-center gap-2 before:content-['•'] before:text-emerald-500 before:mr-1">
                                        {item.detail}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {item.paperCount && Number(item.paperCount) > 0 && (
                                            <span className="font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] border border-blue-100 dark:border-blue-800/50" title="عدد الورق الصافي">
                                                {item.paperCount} ورقة
                                            </span>
                                        )}
                                        <span className="font-black font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-zinc-400">x{item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {order.notes && (
                            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 text-xs text-amber-800/80 dark:text-amber-400 italic leading-relaxed">
                                <span className="font-bold text-amber-700 dark:text-amber-500 not-italic block mb-1">ملاحظة:</span>
                                {order.notes}
                            </div>
                        )}
                    </CardContent>

                    {!isCompleted && (
                        <CardFooter className="px-5 pt-0 pb-5">
                            <Button
                                onClick={() => handleComplete(order)}
                                className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-slate-200/50 dark:shadow-none h-11 rounded-xl"
                            >
                                <Check className="w-5 h-5 ml-2" />
                                تم الإنجاز
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            ))}
        </div>
    )
}
