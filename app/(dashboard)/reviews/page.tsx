import { getReviews } from '@/app/portal/profile/actions'
import { AdminReviewCard } from '@/components/admin/admin-review-card'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
    const reviews = await getReviews()

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: reviews.filter((r: any) => r.rating === stars).length,
        percentage: reviews.length > 0
            ? ((reviews.filter((r: any) => r.rating === stars).length / reviews.length) * 100).toFixed(0)
            : '0'
    }))

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">إدارة التقييمات</h1>
                <p className="text-muted-foreground">
                    مراجعة وإدارة تقييمات العملاء
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">إجمالي التقييمات</p>
                                <p className="text-3xl font-bold mt-2">{reviews.length}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                                <p className="text-3xl font-bold mt-2 flex items-center gap-1">
                                    {avgRating}
                                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Rating Distribution */}
                {ratingDistribution.slice(0, 2).map(({ stars, count }) => (
                    <Card key={stars}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stars} نجوم</p>
                                    <p className="text-3xl font-bold mt-2">{count}</p>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(stars)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Reviews List */}
            <Card>
                <CardContent className="p-6">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            لا توجد تقييمات بعد
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review: any) => (
                                <AdminReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
