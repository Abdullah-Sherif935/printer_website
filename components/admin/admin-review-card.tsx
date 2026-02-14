"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useState } from 'react'
import { deleteReview } from '@/app/portal/profile/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AdminReviewCard({ review }: { review: any }) {
    const router = useRouter()
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        setDeleting(true)
        const result = await deleteReview(review.id)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('تم حذف التقييم بنجاح')
            router.refresh()
        }
        setDeleting(false)
    }

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                        {review.profiles?.full_name?.charAt(0) || 'ع'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm">{review.profiles?.full_name || 'عميل'}</p>
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < review.rating
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                        </p>
                        {review.comment && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                "{review.comment}"
                            </p>
                        )}
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                            disabled={deleting}
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>حذف التقييم؟</AlertDialogTitle>
                            <AlertDialogDescription>
                                هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                حذف
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    )
}
