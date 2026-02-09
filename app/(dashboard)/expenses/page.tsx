import { getExpenses } from './actions'
import { ExpensesTable } from './expenses-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ExpensesPage() {
    const expenses = await getExpenses()
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">المصروفات</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        إجمالي المصروفات: <span className="font-bold text-red-600">EGP {totalExpenses.toFixed(2)}</span>
                    </p>
                </div>
                <Link href="/expenses/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        إضافة مصروف
                    </Button>
                </Link>
            </div>
            <ExpensesTable expenses={expenses} />
        </div>
    )
}
