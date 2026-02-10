"use client"

import { Customer, deleteCustomer, updateDebt, setDebt } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Minus, Calculator, Wallet, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function CustomersTable({ customers }: { customers: Customer[] }) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [debtAmount, setDebtAmount] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف سجلاته أيضاً.')) return

        const result = await deleteCustomer(id)
        if (result.success) {
            toast.success('تم حذف العميل بنجاح')
        } else {
            toast.error('فشل الحذف: ' + result.error)
        }
    }

    async function handleDebtUpdate(operation: 'add' | 'subtract' | 'set') {
        if (!selectedCustomer) return

        const amount = parseFloat(debtAmount)
        if (operation !== 'set' && (isNaN(amount) || amount <= 0)) {
            toast.error('يرجى إدخال مبلغ صحيح')
            return
        }

        setIsUpdating(true)
        let result;
        if (operation === 'set') {
            result = await setDebt(selectedCustomer.id, isNaN(amount) ? 0 : amount)
        } else {
            result = await updateDebt(selectedCustomer.id, amount, operation)
        }

        if (result.success) {
            toast.success('تم تحديث المديونية بنجاح')
            setDebtAmount('')
            setSelectedCustomer(null)
        } else {
            toast.error('فشلت العملية: ' + result.error)
        }
        setIsUpdating(false)
    }

    const totalDebt = customers.reduce((sum, c) => sum + (c.current_debt || 0), 0)

    return (
        <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 text-white border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold opacity-70 text-right">إجمالي الديون الخارجية</CardTitle>
                        <Wallet className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-red-400 font-mono">
                            EGP {totalDebt.toFixed(2)}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">مبالغ مستحقة من كافة العملاء</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold opacity-70 text-right">عدد العملاء</CardTitle>
                        <Plus className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{customers.length} عميل</div>
                        <p className="text-[10px] text-muted-foreground mt-1">إجمالي المسجلين في النظام</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {customers.map((customer) => (
                    <Card key={customer.id} className={`border-none shadow-lg transition-all hover:shadow-xl ${customer.current_debt > 0 ? 'bg-red-50/50 dark:bg-red-900/10 border-r-4 border-r-red-500' : 'border-r-4 border-r-zinc-200'}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-black">{customer.name}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">{customer.phone || 'بدون رقم هاتف'}</p>
                            </div>
                            {customer.current_debt > 0 ? (
                                <Badge className="bg-red-600 font-bold">مديون</Badge>
                            ) : (
                                <Badge variant="outline" className="text-zinc-400">خالص</Badge>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="pt-2">
                                <span className="text-[10px] font-bold opacity-50 block mb-1">المديونية الحالية:</span>
                                <div className={`text-2xl font-black ${customer.current_debt > 0 ? 'text-red-600' : 'text-zinc-300'}`}>
                                    EGP {customer.current_debt?.toFixed(2) || "0.00"}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Dialog open={selectedCustomer?.id === customer.id} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold gap-2"
                                            onClick={() => {
                                                setSelectedCustomer(customer)
                                                setDebtAmount('')
                                            }}
                                        >
                                            <Calculator className="h-4 w-4" />
                                            إدارة الحساب
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[400px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-right text-xl font-black">إدارة مديونية {customer.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-6 py-4">
                                            <div className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                                <span className="text-2xl font-black text-red-600">EGP {customer.current_debt?.toFixed(2) || "0.00"}</span>
                                                <span className="font-bold opacity-70">الحساب الحالي:</span>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-right block font-bold">المبلغ المدخل (EGP):</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={debtAmount}
                                                    onChange={(e) => setDebtAmount(e.target.value)}
                                                    className="h-12 text-center text-xl font-black"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button onClick={() => handleDebtUpdate('add')} className="h-12 bg-zinc-900 font-bold gap-2">
                                                    <Plus className="h-4 w-4" /> زيادة دين
                                                </Button>
                                                <Button onClick={() => handleDebtUpdate('subtract')} variant="outline" className="h-12 border-red-200 text-red-600 hover:bg-red-50 font-bold gap-2" disabled={!customer.current_debt}>
                                                    <Minus className="h-4 w-4" /> تحصيل مبلغ
                                                </Button>
                                            </div>

                                            <div className="border-t pt-4 space-y-3">
                                                <p className="text-[10px] text-muted-foreground text-center">خيارات سريعة:</p>
                                                <Button
                                                    onClick={() => handleDebtUpdate('set')}
                                                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-black gap-2"
                                                    disabled={customer.current_debt === 0 && !debtAmount}
                                                >
                                                    <Check className="h-5 w-5" />
                                                    {debtAmount ? `تغيير الحساب ليصبح ${debtAmount}` : "تصفير المديونية بالكامل"}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 gap-1.5 h-9"
                                    onClick={() => handleDelete(customer.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="text-xs font-bold">حذف العميل</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {customers.length === 0 && (
                <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-muted-foreground font-bold italic">لا يوجد عملاء مسجلين حالياً..</p>
                </div>
            )}
        </div>
    )
}
