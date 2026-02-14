import { getReviews } from '@/app/portal/profile/actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
    const reviews = await getReviews()

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">تقييمات العملاء</h1>
                    <p className="text-sm text-muted-foreground">
                        {reviews.length} تقييم - متوسط {avgRating} ★
                    </p>
                </div>
            </div>

            {reviews.length === 0 ? (
                <Card className="border-dashed py-12 text-center">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full">
                            <MessageSquare className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">لا توجد تقييمات بعد</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                كن أول من يقيّم خدماتنا!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review: any) => (
                        <Card key={review.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                                            {review.profiles?.full_name?.charAt(0) || 'ع'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm">{review.profiles?.full_name || 'عميل'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            {review.comment && (
                                <CardContent className="pt-0 pb-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
