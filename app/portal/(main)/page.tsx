import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusCircle, Clock, CheckCircle2, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export default async function PortalDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch user's orders
    const { data: orders } = await supabase
        .from('active_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">طلباتي</h1>
                    <p className="text-sm text-gray-500">مرحباً بك، يمكنك متابعة حالة طلباتك هنا</p>
                </div>
            </div>

            {(!orders || orders.length === 0) ? (
                <Card className="border-dashed py-10 text-center bg-gray-50/50">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">لا توجد طلبات بعد</h3>
                            <p className="text-sm text-gray-500">قم بإنشاء طلبك الأول لطباعة الملفات بسهولة</p>
                        </div>
                        <Link href="/portal/new">
                            <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                إنشاء طلب جديد
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className={`h-1.5 w-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg line-clamp-1">
                                        {/* Display first item or generic title */}
                                        {order.items && order.items[0] ? order.items[0].detail || 'طلب طباعة' : 'طلب طباعة'}
                                    </CardTitle>
                                    <Badge variant="outline" className={order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                                        {order.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3 text-sm text-gray-600">
                                <div className="flex flex-col gap-1">
                                    {order.items && order.items.length > 0 && (
                                        <div className="text-xs bg-gray-100 p-2 rounded">
                                            {order.items.length} ملفات • {order.items.reduce((acc: number, curr: any) => acc + (Number(curr.paperCount) || 0), 0)} ورقة تقريباً
                                        </div>
                                    )}
                                    {order.notes && (
                                        <p className="line-clamp-2 mt-1 italic text-gray-500">"{order.notes}"</p>
                                    )}
                                </div>
                            </CardContent>
                            {/* Future: Add View Details Button */}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
