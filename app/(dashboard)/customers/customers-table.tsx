"use client"

import { Customer, deleteCustomer, updateDebt } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function CustomersTable({ customers }: { customers: Customer[] }) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [debtAmount, setDebtAmount] = useState('')

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return

        const result = await deleteCustomer(id)
        if (result.success) {
            toast.success('تم حذف العميل بنجاح')
        } else {
            toast.error('فشل الحذف: ' + result.error)
        }
    }

    async function handleDebtUpdate(operation: 'add' | 'subtract') {
        if (!selectedCustomer || !debtAmount) return

        const amount = parseFloat(debtAmount)
        if (isNaN(amount) || amount <= 0) {
            toast.error('يرجى إدخال مبلغ صحيح')
            return
        }

        const result = await updateDebt(selectedCustomer.id, amount, operation)
        if (result.success) {
            toast.success(operation === 'add' ? 'تم إضافة الدين' : 'تم خصم الدين')
            setDebtAmount('')
            setSelectedCustomer(null)
        } else {
            toast.error('فشلت العملية: ' + result.error)
        }
    }

    const totalDebt = customers.reduce((sum, c) => sum + c.current_debt, 0)

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>إجمالي الديون</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                        EGP {totalDebt.toFixed(2)}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customers.map((customer) => (
                    <Card key={customer.id} className={customer.current_debt > 0 ? 'border-red-300' : ''}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">{customer.name}</CardTitle>
                            {customer.current_debt > 0 && (
                                <Badge variant="destructive">مديون</Badge>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                                {customer.phone || 'لا يوجد هاتف'}
                            </div>
                            {customer.current_debt > 0 && (
                                <div className="text-xl font-bold text-red-600">
                                    EGP {customer.current_debt.toFixed(2)}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            <Plus className="h-4 w-4 ml-2" />
                                            إضافة دين
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>إضافة دين - {customer.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input
                                                type="number"
                                                placeholder="المبلغ (EGP)"
                                                value={debtAmount}
                                                onChange={(e) => setDebtAmount(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleDebtUpdate('add')} className="flex-1">
                                                    <Plus className="h-4 w-4 ml-2" />
                                                    إضافة
                                                </Button>
                                                <Button
                                                    onClick={() => handleDebtUpdate('subtract')}
                                                    variant="outline"
                                                    className="flex-1"
                                                    disabled={customer.current_debt === 0}
                                                >
                                                    <Minus className="h-4 w-4 ml-2" />
                                                    سداد
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(customer.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {customers.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        لا يوجد عملاء. قم بإضافة عميل جديد للبدء.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
