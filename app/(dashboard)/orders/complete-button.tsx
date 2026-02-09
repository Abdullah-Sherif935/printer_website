"use client"

import { completeOrder } from './actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

export function CompleteOrderButton({ orderId, status }: { orderId: string, status: string }) {
    async function handleComplete() {
        if (!confirm('هل تريد إكمال هذا الطلب؟ سيتم خصم المخزون تلقائياً.')) return

        const result = await completeOrder(orderId)
        if (result.success) {
            toast.success('تم إكمال الطلب وخصم المخزون')
        } else {
            toast.error('فشل إكمال الطلب: ' + result.error)
        }
    }

    if (status === 'completed') {
        return <span className="text-sm text-green-600 font-medium">مكتمل ✓</span>
    }

    return (
        <Button
            size="sm"
            variant="default"
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700"
        >
            <Check className="h-4 w-4 ml-2" />
            إكمال
        </Button>
    )
}
