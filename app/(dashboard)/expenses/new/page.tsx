import { getExpenseCategories } from '../actions'
import { ExpenseForm } from './expense-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Receipt, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewExpensePage() {
    const categories = await getExpenseCategories()

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/expenses">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
                        <ArrowRight className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl shadow-sm border border-red-200 dark:border-red-800">
                    <Receipt className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-800">تسجيل مصروف جديد</h2>
                    <p className="text-sm text-muted-foreground mt-1">سجل مصروفات التشغيل (إيجار، كهرباء، صيانة...) لمتابعة الأرباح الحقيقية.</p>
                </div>
            </div>

            <Card className="max-w-3xl border-none shadow-xl border-t-4 border-t-red-600 rounded-2xl overflow-hidden">
                <CardHeader className="bg-red-50/50 dark:bg-red-900/10">
                    <CardTitle className="text-right">تفاصيل المصروف</CardTitle>
                    <CardDescription className="text-right">أدخل بيانات المصروف بدقة لضمان صحة التقارير المالية.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <ExpenseForm categories={categories} />
                </CardContent>
            </Card>
        </div>
    )
}
