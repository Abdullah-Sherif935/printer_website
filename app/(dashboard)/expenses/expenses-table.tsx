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
                <Card key={expense.id}>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Badge className={categoryColors[expense.category] || categoryColors.other}>
                                {categoryNames[expense.category] || expense.category}
                            </Badge>
                            <div className="flex-1">
                                <p className="font-medium">{expense.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(expense.date).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-xl font-bold text-red-600">
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
