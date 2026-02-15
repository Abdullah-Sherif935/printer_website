'use client'

import { Button } from '@/components/ui/button'
import { Trash, Edit } from 'lucide-react'
import { deleteOrder } from '@/app/clients/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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

export function OrderCardActions({ orderId, status }: { orderId: string, status: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    if (status !== 'pending') return null

    const handleConfirmDelete = async () => {
        setLoading(true)
        try {
            const result = await deleteOrder(orderId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('تم حذف الطلب بنجاح')
                // Wait a bit to ensure server action revalidates
                router.refresh()
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الحذف')
        } finally {
            setLoading(false)
        }
    }

    /* 
     * NOTE: Edit functionality is tricky without a dedicated page.
     * For now, we rely on Delete -> New Order.
     * If user wants to edit, they can delete and recreate easily since the form is right there.
     * We can add a "Copy to Form" feature later if needed.
     */

    return (
        <div className="flex gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" disabled={loading}>
                        <Trash className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            لا يمكن التراجع عن هذا الإجراء. سيتم حذف الطلب نهائياً.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            نعم، احذف الطلب
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
