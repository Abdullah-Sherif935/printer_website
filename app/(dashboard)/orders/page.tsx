import { getOrders } from "./actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CompleteOrderButton } from "./complete-button"

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">قائمة الطلبات</h2>
                <Button asChild>
                    <Link href="/orders/new">
                        <Plus className="mr-2 h-4 w-4" /> طلب جديد
                    </Link>
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>رقم الطلب</TableHead>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>العميل</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>المدفوع</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders && orders.length > 0 ? (
                            orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                            {order.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{order.customers?.name || 'عميل عادي'}</TableCell>
                                    <TableCell>EGP {order.total_amount}</TableCell>
                                    <TableCell>EGP {order.paid_amount}</TableCell>
                                    <TableCell className="text-right">
                                        <CompleteOrderButton orderId={order.id} status={order.status} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    لا توجد طلبات مسجلة.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
