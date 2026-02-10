"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompleteOrderButton } from "./complete-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Wallet, Clock, Search, ListFilter, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"

export function SalesDisplay({ initialOrders }: { initialOrders: any[] }) {
    const [filter, setFilter] = useState("all")

    const filteredOrders = initialOrders.filter(order => {
        if (filter === "cash") return order.total_amount - order.paid_amount <= 0 && order.status === 'completed'
        if (filter === "credit") return order.total_amount - order.paid_amount > 0
        return true
    })

    const stats = {
        count: initialOrders.length,
        totalSales: initialOrders.reduce((sum, o) => sum + o.total_amount, 0),
        totalRemaining: initialOrders.reduce((sum, o) => sum + (o.total_amount - o.paid_amount), 0),
        totalProfit: initialOrders.reduce((sum, o) => sum + (o.total_amount * 0.4), 0)
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-right">عدد المبيعات</CardTitle>
                        <TrendingUp className="h-4 w-4 opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.count} عملية</div>
                        <p className="text-[10px] opacity-70 mt-1">إجمالي الحركات المسجلة</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white dark:bg-zinc-900 border-r-4 border-r-blue-500 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-blue-600 text-right">إجمالي المبيعات</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black font-mono">EGP {stats.totalSales.toFixed(2)}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">القيمة الكلية للمبيعات</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white dark:bg-zinc-900 border-r-4 border-r-amber-500 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-amber-600 text-right">المبالغ المتبقية (آجل)</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black font-mono text-amber-600">EGP {stats.totalRemaining.toFixed(2)}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">ديون لم يتم تحصيلها</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-zinc-900 text-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-emerald-400 text-right">صافي الأرباح</CardTitle>
                        <Banknote className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black font-mono text-emerald-400">EGP {stats.totalProfit.toFixed(2)}</div>
                        <p className="text-[10px] text-emerald-500/70 mt-1">إجمالي الأرباح المحتملة</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border gap-4">
                <div className="flex items-center gap-2">
                    <ListFilter className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-bold">تصفية المبيعات:</span>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-muted/50 border-none h-10 font-bold">
                        <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="font-bold text-right">كل المبيعات</SelectItem>
                        <SelectItem value="cash" className="font-bold text-emerald-600 text-right">مبيعات كاش فقط</SelectItem>
                        <SelectItem value="credit" className="font-bold text-amber-600 text-right">مبيعات آجل (دين)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-extrabold text-right whitespace-nowrap">رقم العملية</TableHead>
                                <TableHead className="font-extrabold text-right whitespace-nowrap">التاريخ</TableHead>
                                <TableHead className="font-extrabold text-right whitespace-nowrap">الحالة</TableHead>
                                <TableHead className="font-extrabold text-right whitespace-nowrap">العميل</TableHead>
                                <TableHead className="font-extrabold text-center whitespace-nowrap">المبلغ الكلي</TableHead>
                                <TableHead className="font-extrabold text-center whitespace-nowrap">المقبوض</TableHead>
                                <TableHead className="font-extrabold text-center whitespace-nowrap">المتبقي</TableHead>
                                <TableHead className="text-left font-extrabold whitespace-nowrap">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order: any) => (
                                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-mono text-xs opacity-60 whitespace-nowrap px-4">#{order.id.slice(0, 8)}</TableCell>
                                        <TableCell className="font-medium whitespace-nowrap px-4">
                                            {new Date(order.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-4">
                                            <Badge
                                                variant={order.status === 'completed' ? 'default' : (order.status === 'partial_payment' ? 'outline' : 'secondary')}
                                                className={cn(
                                                    "rounded-full px-3 py-1",
                                                    order.status === 'completed' ? "bg-emerald-500 hover:bg-emerald-500" :
                                                        (order.status === 'partial_payment' ? "border-amber-500 text-amber-600 border-2 font-black" : "")
                                                )}
                                            >
                                                {order.status === 'completed' ? 'مكتمل' : (order.status === 'partial_payment' ? 'آجل / متبقي' : 'قيد الانتظار')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-blue-700 whitespace-nowrap px-4">{order.customers?.name || 'عميل عادي'}</TableCell>
                                        <TableCell className="text-center font-black whitespace-nowrap px-4">EGP {order.total_amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-center text-emerald-600 font-bold whitespace-nowrap px-4">EGP {order.paid_amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-center whitespace-nowrap px-4">
                                            {order.total_amount - order.paid_amount > 0 ? (
                                                <span className="text-destructive font-black bg-destructive/10 px-2 py-1 rounded-lg">
                                                    EGP {(order.total_amount - order.paid_amount).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600 opacity-40">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap px-4">
                                            <CompleteOrderButton
                                                orderId={order.id}
                                                status={order.status}
                                                totalAmount={order.total_amount}
                                                paidAmount={order.paid_amount}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground whitespace-nowrap px-4">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="h-8 w-8 opacity-20" />
                                            <span>لا توجد مبيعات تطابق هذا الاختيار.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

