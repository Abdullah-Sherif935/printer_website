"use client"

import { useState } from 'react'
import { updateOrderPayment } from './actions-v2'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check, Banknote, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function CompleteOrderButton({
    orderId,
    status,
    totalAmount,
    paidAmount
}: {
    orderId: string,
    status: string,
    totalAmount: number,
    paidAmount: number
}) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [newPaidAmount, setNewPaidAmount] = useState(paidAmount.toString())
    const [isOpen, setIsOpen] = useState(false)

    const remaining = totalAmount - paidAmount

    async function handleUpdatePayment() {
        const amount = parseFloat(newPaidAmount)
        if (isNaN(amount) || amount < 0) {
            toast.error('يرجى إدخال مبلغ صحيح')
            return
        }

        setIsUpdating(true)
        const result = await updateOrderPayment(orderId, amount)
        if (result.success) {
            toast.success('تم تحديث بيانات الدفع بنجاح')
            setIsOpen(false)
        } else {
            toast.error('فشل التحديث: ' + result.error)
        }
        setIsUpdating(false)
    }

    if (status === 'completed' && remaining <= 0) {
        return <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 italic">مدفوع بالكامل ✓</span>
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            {remaining > 0 && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 gap-2 font-bold text-[10px] sm:text-xs">
                            <Banknote className="h-3.5 w-3.5" />
                            تحصيل المتبقي ({remaining})
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-right">تحديث مبالغ التحصيل</DialogTitle>
                            <DialogDescription className="text-right">
                                قم بتعديل المبلغ الإجمالي المقبوض من العميل حتى الآن.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex justify-between p-3 bg-muted rounded-lg text-sm">
                                <span className="font-bold">EGP {totalAmount.toFixed(2)}</span>
                                <span className="opacity-70">إجمالي قيمة المبيعة:</span>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="paid" className="text-right font-bold">المبلغ المقبوض الكلي:</Label>
                                <div className="relative">
                                    <Input
                                        id="paid"
                                        type="number"
                                        value={newPaidAmount}
                                        onChange={(e) => setNewPaidAmount(e.target.value)}
                                        className="text-center text-lg font-black h-12"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">EGP</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-right mt-1">
                                    * أدخل إجمالي ما استلمته من العميل لهذا الطلب (المبلغ القديم + الجديد).
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdatePayment} disabled={isUpdating} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ التعديلات"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {status !== 'completed' && (
                <Button
                    size="sm"
                    variant="default"
                    onClick={async () => {
                        if (!confirm('هل تريد إكمال هذا الطلب؟ سيتم خصم المخزون تلقائياً.')) return
                        const result = await updateOrderPayment(orderId, paidAmount, 'completed')
                        if (result.success) toast.success('تم إكمال الطلب')
                        else toast.error(result.error)
                    }}
                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                >
                    <Check className="h-3 w-3 ml-1" />
                    إكمال
                </Button>
            )}
        </div>
    )
}
