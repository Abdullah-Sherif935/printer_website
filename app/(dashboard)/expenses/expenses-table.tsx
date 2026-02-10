"use client"

import { Expense, deleteExpense } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const categoryColors: Record<string, string> = {
    'rent': 'bg-blue-500',
    'electricity': 'bg-yellow-500',
    'water': 'bg-cyan-500',
    'maintenance': 'bg-orange-500',
    'supplies': 'bg-purple-500',
    'other': 'bg-gray-500'
}

const categoryNames: Record<string, string> = {
    'rent': 'إيجار',
    'electricity': 'كهرباء',
    'water': 'مياه',
    'maintenance': 'صيانة',
    'supplies': 'لوازم',
    'other': 'أخرى'
}

export function ExpensesTable({ expenses }: { expenses: Expense[] }) {
    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return

        const result = await deleteExpense(id)
        if (result.success) {
            toast.success('تم حذف المصروف بنجاح')
        } else {
            toast.error('فشل الحذف: ' + result.error)
        }
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => (
                <Card key={expense.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Badge className={`${categoryColors[expense.category] || categoryColors.other} text-white border-none h-7 px-3 rounded-full font-bold whitespace-nowrap`}>
                                {categoryNames[expense.category] || expense.category}
                            </Badge>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-zinc-800 line-clamp-1">{expense.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(expense.expense_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                            <div className="text-xl md:text-2xl font-black text-red-600 font-mono">
                                EGP {expense.amount.toFixed(2)}
                            </div>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(expense.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {expenses.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        لا توجد مصروفات مسجلة. قم بإضافة مصروف جديد للبدء.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
