import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { getDashboardStats } from './actions'
import { DollarSign, CreditCard, Activity, Users } from "lucide-react"

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!stats) return <div>Failed to load stats</div>

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">لوحة التحكم</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            إجمالي الإيرادات
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">EGP {stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% من الشهر الماضي
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            الطلبات النشطة
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            قيد المعالجة
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-500' : ''}`}>{stats.lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">
                            أصناف أقل من الحد
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>نظرة عامة</CardTitle>
                        <CardDescription>
                            الإيرادات الشهرية
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={stats.monthlyRevenue} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>آخر المبيعات</CardTitle>
                        <CardDescription>
                            لديك {stats.recentSales.length} مبيعات حديثة.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentSales sales={stats.recentSales} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
