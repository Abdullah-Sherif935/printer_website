"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Star, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useState } from 'react'
import { ReviewDialog } from './review-dialog'

export function DeliveredOrderCard({ order }: { order: any }) {
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

    return (
        <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1.5 w-full bg-gray-400" />
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-500" />
                            {order.items && order.items[0] ? order.items[0].detail || 'طلب طباعة' : 'طلب طباعة'}
                        </CardTitle>
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 gap-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            مسلّم
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        تم التسليم {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
                    </p>
                </CardHeader>
                <CardContent className="pb-3 text-sm">
                    <div className="flex flex-col gap-2">
                        {order.items && order.items.length > 0 && (
                            <div className="text-xs bg-gray-100 dark:bg-zinc-800 p-2 rounded flex justify-between">
                                <span>{order.items.length} ملفات</span>
                                <span>{order.items.reduce((acc: number, curr: any) => acc + (Number(curr.paperCount) || Number(curr.quantity) || 0), 0)} عنصر</span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4">
                    <Button
                        onClick={() => setReviewDialogOpen(true)}
                        className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                    >
                        <Star className="w-4 h-4" />
                        قيّم تجربتك
                    </Button>
                </CardFooter>
            </Card>

            <ReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                orderId={order.id}
            />
        </>
    )
}
