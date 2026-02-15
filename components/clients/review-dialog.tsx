"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Star, Loader2 } from "lucide-react"
import { createReview } from '@/app/clients/profile/actions'
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ReviewDialog({
    orderId,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: {
    orderId?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    // Wrapper for setting open state
    const setOpen = (newOpen: boolean) => {
        if (isControlled) {
            setControlledOpen?.(newOpen)
        } else {
            setInternalOpen(newOpen)
        }
    }

    const [loading, setLoading] = useState(false)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState<number | null>(null)
    const [comment, setComment] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error("يرجى اختيار التقييم")
            return
        }

        setLoading(true)
        const result = await createReview({
            order_id: orderId,
            rating,
            comment
        })

        if (result?.error) {
            toast.error(result?.error)
        } else {
            toast.success("شكراً لتقييمك!")
            setOpen(false)
            setComment("")
            setRating(0)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        <span>أضف تقييمك</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center">إضافة تقييم جديد</DialogTitle>
                    <DialogDescription className="text-center">
                        شاركنا تجربتك ورأيك في الخدمة المقدمة.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="flex flex-col items-center justify-center gap-4 py-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className="rounded-full p-1 hover:bg-muted transition-colors focus:outline-none"
                                >
                                    <Star
                                        className={`h-8 w-8 transition-colors ${star <= (hoverRating ?? rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "fill-transparent text-gray-300 dark:text-gray-600"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground h-5">
                            {(hoverRating ?? rating) > 0 &&
                                ["سيء جداً", "سيء", "متوسط", "جيد", "ممتاز"][(hoverRating ?? rating)! - 1]
                            }
                        </div>
                    </div>
                    <Textarea
                        placeholder="اكتب تعليقك هنا..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="col-span-3 min-h-[100px] resize-none"
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full font-bold bg-emerald-600 hover:bg-emerald-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            نشر التقييم
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
