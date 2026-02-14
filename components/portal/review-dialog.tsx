"use client"

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { createReview } from '@/app/portal/profile/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ReviewDialog({
    open,
    onOpenChange,
    orderId
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderId: string
}) {
    const router = useRouter()
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        if (rating === 0) {
            toast.error('الرجاء اختيار تقييم')
            return
        }

        setLoading(true)
        const result = await createReview({
            order_id: orderId,
            rating,
            comment: comment.trim() || undefined
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('شكراً لتقييمك! 🎉')
            onOpenChange(false)
            setRating(0)
            setComment('')
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>قيّم تجربتك</DialogTitle>
                    <DialogDescription>
                        نحن نهتم برأيك! ساعدنا في تحسين خدماتنا
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Star Rating */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">التقييم</label>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-all ${star <= (hoveredRating || rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-muted-foreground">
                                {rating === 5 && 'ممتاز! 🌟'}
                                {rating === 4 && 'جيد جداً! 😊'}
                                {rating === 3 && 'جيد 👍'}
                                {rating === 2 && 'مقبول 😐'}
                                {rating === 1 && 'يحتاج تحسين 😔'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label htmlFor="comment" className="text-sm font-medium">
                            تعليق (اختياري)
                        </label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="شاركنا رأيك وتجربتك معنا..."
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-left" dir="ltr">
                            {comment.length}/500
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="flex-1"
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                جاري الإرسال...
                            </>
                        ) : (
                            'إرسال التقييم'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
