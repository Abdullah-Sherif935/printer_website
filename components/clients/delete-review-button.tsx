'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteReview } from '@/app/clients/profile/actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.')) return

        setLoading(true)
        const result = await deleteReview(reviewId)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('تم حذف التقييم بنجاح')
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={loading}
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="حذف التقييم"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="sr-only">حذف التقييم</span>
        </Button>
    )
}
