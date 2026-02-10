"use client"

import { useState } from 'react'
import { addExpense } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function ExpenseForm({ categories }: { categories: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categoryId, setCategoryId] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.set('category_id', categoryId)

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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="description" className="text-right block font-bold">الوصف (ما هو هذا المصروف؟)</Label>
                <Input
                    id="description"
                    name="description"
                    placeholder="مثال: فاتورة كهرباء شهر يناير"
                    required
                    className="h-12 text-right font-medium"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="amount" className="text-right block font-bold">المبلغ (EGP)</Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="h-12 text-center font-black text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-right block font-bold">التصنيف</Label>
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                        <SelectTrigger className="h-12 text-right dir-rtl">
                            <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id} className="text-right">{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="expense_date" className="text-right block font-bold">التاريخ</Label>
                <Input
                    id="expense_date"
                    name="expense_date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="h-12 text-center font-bold"
                />
            </div>
            <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading || !categoryId} className="flex-1 h-12 bg-red-600 hover:bg-red-700 font-black text-lg shadow-lg shadow-red-500/20">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'حفظ المصروف'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-12 px-8 font-bold"
                >
                    إلغاء
                </Button>
            </div>
        </form>
    )
}
