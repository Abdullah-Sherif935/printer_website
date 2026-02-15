import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, FileText, History, PlayCircle, Package, Truck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { PortalOrderForm } from '@/components/clients/order-form'
import { OrderCardActions } from '@/components/clients/order-card-actions'
import { getSettings } from '@/app/(dashboard)/settings/actions'

// Helper to get status display info
function getOrderStatus(status: string) {
    switch (status) {
        case 'processing':
            return {
                label: 'جاري التنفيذ',
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                barColor: 'bg-blue-500',
                icon: PlayCircle
            }
        case 'completed':
            return {
                label: 'جاهز للاستلام',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                barColor: 'bg-emerald-500',
                icon: CheckCircle2
            }
        case 'delivered':
            return {
                label: 'تم التسليم',
                color: 'bg-gray-50 text-gray-600 border-gray-200',
                barColor: 'bg-gray-400',
                icon: Package
            }
        default: // pending
            return {
                label: 'قيد الانتظار',
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                barColor: 'bg-amber-500',
                icon: Clock
            }
    }
}

export default async function PortalDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const settings = await getSettings()

    if (!user) return null

    // Fetch user's orders (exclude delivered ones - they're in /clients/orders)
    const { data: orders } = await supabase
        .from('active_orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing', 'completed'])
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-12 pb-10">
            {/* 1. New Order Section (Top) with History nested as Children */}
            <PortalOrderForm userId={user.id} settings={settings}>
                <div className="h-px bg-gray-200 w-full mb-8" />

                {/* 2. Orders History Section (Bottom - Only shows when no form active) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <History className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">سجل طلباتي</h2>
                    </div>

                    {(!orders || orders.length === 0) ? (
                        <Card className="border-dashed py-8 text-center bg-gray-50/50">
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-full">
                                    <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">لا توجد طلبات سابقة</h3>
                                    <p className="text-sm text-gray-500">ستظهر طلباتك هنا بعد إرسالها</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => {
                                const statusInfo = getOrderStatus(order.status)
                                const StatusIcon = statusInfo.icon

                                return (
                                    <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow border-t-4 border-t-transparent hover:border-t-primary/20">
                                        <div className={`h-1.5 w-full ${statusInfo.barColor}`} />
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg line-clamp-1">
                                                    {order.items && order.items[0] ? order.items[0].detail || 'طلب طباعة' : 'طلب طباعة'}
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`${statusInfo.color} gap-1 text-[10px] font-bold`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </Badge>
                                                    <OrderCardActions orderId={order.id} status={order.status} />
                                                </div>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-3 text-sm text-gray-600">
                                            <div className="flex flex-col gap-1">
                                                {order.items && order.items.length > 0 && (
                                                    <div className="text-xs bg-gray-100 p-2 rounded flex justify-between">
                                                        <span>{order.items.length} ملفات</span>
                                                        <span>{order.items.reduce((acc: number, curr: any) => acc + (Number(curr.paperCount) || Number(curr.quantity) || 0), 0)} عنصر</span>
                                                    </div>
                                                )}
                                                {order.notes && (
                                                    <p className="line-clamp-2 mt-1 italic text-gray-500 text-xs">"{order.notes}"</p>
                                                )}

                                                {/* Status Progress Bar */}
                                                <div className="mt-3 flex items-center gap-1">
                                                    <div className={`h-1.5 flex-1 rounded-full ${order.status === 'pending' || order.status === 'processing' || order.status === 'completed' || order.status === 'delivered' ? 'bg-amber-400' : 'bg-gray-200'}`} />
                                                    <div className={`h-1.5 flex-1 rounded-full ${order.status === 'processing' || order.status === 'completed' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-200'}`} />
                                                    <div className={`h-1.5 flex-1 rounded-full ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                                    <div className={`h-1.5 flex-1 rounded-full ${order.status === 'delivered' ? 'bg-gray-500' : 'bg-gray-200'}`} />
                                                </div>
                                                <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                                                    <span>انتظار</span>
                                                    <span>تنفيذ</span>
                                                    <span>جاهز</span>
                                                    <span>تسليم</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </section>
            </PortalOrderForm>
        </div>
    )
}
