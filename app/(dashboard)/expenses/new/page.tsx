"use client"

import { useState } from 'react'
import { addExpense } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function NewExpensePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.set('category', category)

        const result = await addExpense(formData)

        if (result.success) {
            toast.success('تم إضافة المصروف بنجاح')
            router.push('/expenses')
        } else {
            toast.error('فشلت الإضافة: ' + result.error)
        }

        setLoading(false)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">إضافة مصروف جديد</h2>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>تفاصيل المصروف</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">الوصف *</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="مثال: فاتورة كهرباء شهر يناير"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">المبلغ (EGP) *</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>التصنيف *</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر التصنيف" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rent">إيجار</SelectItem>
                                    <SelectItem value="electricity">كهرباء</SelectItem>
                                    <SelectItem value="water">مياه</SelectItem>
                                    <SelectItem value="maintenance">صيانة</SelectItem>
                                    <SelectItem value="supplies">لوازم</SelectItem>
                                    <SelectItem value="other">أخرى</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expense_date">التاريخ</Label>
                            <Input
                                id="expense_date"
                                name="expense_date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading || !category}>
                                {loading ? 'جاري الحفظ...' : 'حفظ'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
