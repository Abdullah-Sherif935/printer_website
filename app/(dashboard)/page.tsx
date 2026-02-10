import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueExpensesChart } from '@/components/dashboard/revenue-expenses-chart'
import { RevenueBreakdownChart } from '@/components/dashboard/revenue-breakdown-chart'
import { DailyPerformanceChart } from '@/components/dashboard/daily-performance-chart'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { getDashboardStats } from './actions'
import { Banknote, Wallet, TrendingUp, ShoppingBag, AlertTriangle, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart3, ListTodo } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    if (!stats) return <div>Failed to load stats</div>

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight flex gap-3 items-center">
                    <BarChart3 className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                    لوحة التحليل المالي
                </h2>
                <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-xs md:text-sm font-bold w-full sm:w-auto text-center">
                    {new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}
                </div>
            </div>

            {/* Main Financial KPI Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* ... existing cards ... */}
                <Card className="border-none shadow-lg bg-emerald-600 text-white rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold opacity-80 text-right">صافي الربح</CardTitle>
                        <TrendingUp className="h-5 w-5 opacity-50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-black">EGP {stats.netProfit.toFixed(2)}</div>
                        <p className="text-[10px] md:text-xs mt-2 opacity-70">بعد خصم المصاريف وتكلفة الخامات</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 rounded-2xl border-r-4 border-r-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 text-right">إجمالي المبيعات</CardTitle>
                        <Banknote className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-black">EGP {stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-2">إجمالي دخل القبو بالكامل</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 rounded-2xl border-r-4 border-r-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 text-right">مصاريف التشغيل</CardTitle>
                        <Wallet className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-black">EGP {stats.totalOpExpenses.toFixed(2)}</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-2">كهرباء، إيجار، عمالة...</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 rounded-2xl border-r-4 border-r-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-500 text-right">مخزون منخفض</CardTitle>
                        <AlertTriangle className={`h-5 w-5 ${stats.lowStockCount > 0 ? 'text-amber-500 animate-pulse' : 'text-zinc-300'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl md:text-3xl font-black ${stats.lowStockCount > 0 ? 'text-amber-600' : ''}`}>{stats.lowStockCount}</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-2">أصناف تحتاج إعادة طلب</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Graph: Revenue vs Costs */}
                <Card className="lg:col-span-4 border-none shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg md:text-xl">الإيرادات مقابل المصروفات</CardTitle>
                            <CardDescription className="text-xs md:text-sm">مقارنة الدخل والخرج لآخر 6 أشهر</CardDescription>
                        </div>
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-zinc-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-1 md:px-2">
                        <RevenueExpensesChart data={stats.monthlyRevenueVsExpenses} />
                    </CardContent>
                </Card>

                {/* Pie Chart: Revenue Breakdown */}
                <Card className="lg:col-span-3 border-none shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg md:text-xl">توزيع الدخل</CardTitle>
                            <CardDescription className="text-xs md:text-sm">مصادر الربح الرئيسية</CardDescription>
                        </div>
                        <PieChartIcon className="h-5 w-5 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <RevenueBreakdownChart data={stats.sourceBreakdown} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                {/* Daily Performance */}
                <Card className="lg:col-span-3 border-none shadow-xl rounded-2xl bg-zinc-900 text-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg text-white">الأداء اليومي</CardTitle>
                            <CardDescription className="text-zinc-400 text-xs md:text-sm">مبيعات الشهر الحالي</CardDescription>
                        </div>
                        <LineChartIcon className="h-5 w-5 text-blue-400" />
                    </CardHeader>
                    <CardContent className="px-1 md:px-2">
                        <DailyPerformanceChart data={stats.dailyPerformance} />
                    </CardContent>
                </Card>

                {/* Recent Sales */}
                <Card className="lg:col-span-4 border-none shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg md:text-xl text-right">أحدث المبيعات</CardTitle>
                            <CardDescription className="text-right text-xs md:text-sm">آخر {stats.recentSales.length} عمليات مسجلة</CardDescription>
                        </div>
                        <ShoppingBag className="h-5 w-5 text-zinc-400" />
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <RecentSales sales={stats.recentSales} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
