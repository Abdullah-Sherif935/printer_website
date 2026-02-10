"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { InventoryItem, addInventoryItem, updateInventoryItem } from './actions'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function InventoryForm({
    initialItem,
    trigger
}: {
    initialItem?: InventoryItem,
    trigger?: React.ReactNode
}) {
    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const isEditing = !!initialItem

    async function clientAction(formData: FormData) {
        let result;
        if (isEditing && initialItem) {
            result = await updateInventoryItem(initialItem.id, null, formData)
        } else {
            result = await addInventoryItem(null, formData)
        }

        if (result.message.includes('successfully')) {
            toast.success(isEditing ? 'تم تحديث الصنف بنجاح' : 'تم إضافة الصنف بنجاح')
            setOpen(false)
        } else {
            toast.error('حدث خطأ: ' + result.message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/20 gap-2 h-11 px-6">
                        <Plus className="h-5 w-5" /> إضافة صنف جديد
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-right text-xl font-black">
                        {isEditing ? 'تعديل بيانات الصنف' : 'إضافة صنف للمخزن'}
                    </DialogTitle>
                    <DialogDescription className="text-right">
                        {isEditing ? 'قم بتعديل بيانات الصنف الحالي ثم اضغط حفظ.' : 'قم بإدخال بيانات الصنف الجديد هنا. اضغط على حفظ عند الانتهاء.'}
                    </DialogDescription>
                </DialogHeader>
                <form action={clientAction} className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-right block font-bold">اسم الصنف (ورق، حبر، إلخ)</Label>
                        <Input id="name" name="name" defaultValue={initialItem?.name} placeholder="مثلاً: ورق A4 80 جرام" className="text-right font-medium h-12" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-right block font-bold">نوع الصنف</Label>
                        <Select name="type" required defaultValue={initialItem?.type || "paper"}>
                            <SelectTrigger className="h-12 text-right dir-rtl">
                                <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="paper">خامات ورق (A4, A3...)</SelectItem>
                                <SelectItem value="binding">مستلزمات تكعيب (سلك/كويل)</SelectItem>
                                <SelectItem value="cover">أغلفة (شفاف/كريستال...)</SelectItem>
                                <SelectItem value="ink">أحبار وتونر</SelectItem>
                                <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-right block font-bold">الكمية المتاحة</Label>
                            <Input id="quantity" name="quantity" type="number" defaultValue={initialItem?.quantity} placeholder="0" className="text-center font-black h-12" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cost_per_unit" className="text-right block font-bold">تكلفة الوحدة (EGP)</Label>
                            <Input id="cost_per_unit" name="cost_per_unit" type="number" step="0.0001" defaultValue={initialItem?.cost_per_unit} placeholder="0.00" className="text-center font-black h-12" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="low_stock_threshold" className="text-right block font-bold text-amber-600">تنبيه عند انخفاض الكمية عن:</Label>
                        <Input id="low_stock_threshold" name="low_stock_threshold" type="number" defaultValue={initialItem?.low_stock_threshold || 50} className="text-center font-bold h-12 border-amber-200" required />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="submit" className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg">
                            {isEditing ? 'حفظ التغييرات' : 'حفظ الصنف'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
