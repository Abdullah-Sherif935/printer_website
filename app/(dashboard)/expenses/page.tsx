import { getExpenses } from './actions'
import { ExpensesTable } from './expenses-table'
import { Button } from '@/components/ui/button'
import { Plus, Receipt, TrendingUp, Wallet } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ExpensesPage() {
    const expenses = await getExpenses()
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const thisMonthTotal = expenses
        .filter(e => {
            const d = new Date(e.expense_date)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
        })
        .reduce((sum, e) => sum + e.amount, 0)

    const lastMonthTotal = expenses
        .filter(e => {
            const d = new Date(e.expense_date)
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
        })
        .reduce((sum, e) => sum + e.amount, 0)

    const percentChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-800">سجل المصروفات التشغيلية</h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        تابع كل ما يتم صرفه لإدارة المحل (إيجار، كهرباء، صيانة...)
                    </p>
                </div>
                <Link href="/expenses/new" className="w-full sm:w-auto">
                    <Button className="w-full bg-red-600 hover:bg-red-700 font-black shadow-lg shadow-red-500/20 gap-2 h-11 px-6 text-white rounded-xl">
                        <Plus className="h-5 w-5" /> تسجيل مصروف جديد
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-none shadow-md bg-white dark:bg-zinc-900 border-r-4 border-r-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-red-600">مصروفات هذا الشهر</CardTitle>
                        <Receipt className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black font-mono">EGP {thisMonthTotal.toFixed(2)}</div>
                        <p className={`text-xs mt-1 font-bold ${percentChange > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {percentChange > 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`} عن الشهر الماضي
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white dark:bg-zinc-900 border-r-4 border-r-zinc-400">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold opacity-60">مصروفات الشهر الماضي</CardTitle>
                        <TrendingUp className="h-4 w-4 opacity-40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black font-mono opacity-60">EGP {lastMonthTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-right">إجمالي ميزانية التشغيل السابقة</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-zinc-900 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold">إجمالي المصروفات (تراكمي)</CardTitle>
                        <Wallet className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black font-mono text-red-400">EGP {totalExpenses.toFixed(2)}</div>
                        <p className="text-xs text-zinc-400 mt-1">كافة الحركات المسجلة في السجل</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                <ExpensesTable expenses={expenses} />
            </Card>
        </div>
    )
}
