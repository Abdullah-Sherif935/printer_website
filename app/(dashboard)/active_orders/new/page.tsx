import { ActiveOrderForm } from "@/components/active-orders/active-order-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewActiveOrderPage() {
    return (
        <div className="flex-1 max-w-4xl mx-auto space-y-6 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/active_orders">
                    <Button variant="ghost" className="h-10 w-10 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-black text-slate-800">إضافة طلب جديد</h2>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                <ActiveOrderForm />
            </div>
        </div>
    )
}
