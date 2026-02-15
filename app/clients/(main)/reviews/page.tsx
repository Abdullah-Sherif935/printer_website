import { getReviews } from '@/app/clients/profile/actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ReviewDialog } from '@/components/clients/review-dialog'

export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
    const reviews = await getReviews() || []

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl shadow-sm">
                        <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">تقييمات العملاء</h1>
                        <p className="text-sm text-muted-foreground">
                            {reviews.length} تقييم - متوسط {avgRating} ★
                        </p>
                    </div>
                </div>

                <ReviewDialog />
            </div>

            {reviews.length === 0 ? (
                <Card className="border-dashed py-12 text-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full animate-bounce">
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
                <div className="grid gap-4 md:grid-cols-2">
                    {reviews.map((review: any) => (
                        <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                                            {review.profiles?.full_name?.charAt(0) || 'ع'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{review.profiles?.full_name || 'عميل'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < review.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-gray-200 text-gray-200 dark:fill-gray-800 dark:text-gray-800'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            {review.comment && (
                                <CardContent className="pt-0 pb-4">
                                    <div className="relative">
                                        <span className="absolute -top-2 -right-1 text-4xl text-gray-100 dark:text-gray-800 font-serif leading-none select-none">"</span>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pr-4">
                                            {review.comment}
                                        </p>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
