"use client"

import { useState, useMemo, useEffect } from "react"
import { InventoryItem } from "@/app/(dashboard)/inventory/actions"
import { SettingsMap } from "@/app/(dashboard)/settings/actions"
import { Customer, quickAddCustomer } from "@/app/(dashboard)/customers/actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { createOrder } from "@/app/(dashboard)/orders/actions-v2"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Trash2, Calculator, User, School, FileText, Layers, Loader2, RotateCcw, Save, TrendingUp, DollarSign, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface OrderCalculatorProps {
    inventory: InventoryItem[]
    settings: SettingsMap
    customers: Customer[]
}

interface OrderItem {
    id: string
    paperId: string
    totalPages: number
    copies: number
    colorMode: "bw" | "color" | "mixed"
    colorPages: number
    useBinding: boolean
    coilId: string // inventory id
}


const STORAGE_KEY = "printpos_draft_sale"

export function OrderCalculator({ inventory, settings, customers: initialCustomers }: OrderCalculatorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoaded, setIsLoaded] = useState(false)

    const [items, setItems] = useState<OrderItem[]>([{
        id: Math.random().toString(),
        paperId: "",
        totalPages: 10,
        copies: 1,
        colorMode: "bw",
        colorPages: 0,
        useBinding: false,
        coilId: ""
    }])

    const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
    const [customerId, setCustomerId] = useState<string>("")
    const [manualPrice, setManualPrice] = useState<string>("")
    const [paidAmount, setPaidAmount] = useState<string>("")

    // Quick Add Customer State
    const [isAddingCustomer, setIsAddingCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState("")
    const [newCustomerPhone, setNewCustomerPhone] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Load draft from localStorage on mount unless we have query params
    useEffect(() => {
        const savedDraft = localStorage.getItem(STORAGE_KEY)
        const source = searchParams.get('source')

        // If coming from active_orders, prioritize URL params over draft
        if (source === 'active_orders') {
            const customerName = searchParams.get('customerName')
            const customerPhone = searchParams.get('customerPhone')
            const itemsParam = searchParams.get('items')

            // Handle Customer
            if (customerName) {
                // We need to check in the customers list passed as props or state
                // Note: 'customers' state is available in closure but might be stale on first render if not careful, 
                // but since this runs on mount, initialCustomers are loaded.
                const existingCustomer = initialCustomers.find(c => c.name === customerName)
                if (existingCustomer) {
                    setCustomerId(existingCustomer.id)
                    toast.success(`تم اختيار العميل: ${existingCustomer.name}`)

                    // If existing customer has no phone but we have one from URL, prompt/notify
                    if (!existingCustomer.phone && customerPhone) {
                        toast.info(`تنبيه: هذا العميل ليس لديه رقم مسجل، بينما الطلب يحتوي على رقم: ${customerPhone}`)
                        // Optionally update state to allow easy addition/update if logic permits
                        setNewCustomerPhone(customerPhone)
                    }
                } else {
                    setNewCustomerName(customerName)
                    setNewCustomerPhone(customerPhone || "")
                    setIsDialogOpen(true)
                    // Pre-fill dialog needs state update which is handled above
                    toast.info(`العميل "${customerName}" غير موجود، يرجى إضافته`)
                }
            }

            // Handle Items
            if (itemsParam) {
                try {
                    const activeOrderItems = JSON.parse(itemsParam)
                    if (Array.isArray(activeOrderItems) && activeOrderItems.length > 0) {
                        const newItems = activeOrderItems.map((item: any) => ({
                            id: Math.random().toString(),
                            paperId: "",
                            totalPages: Number(item.p || item.paperCount) || 10,
                            copies: Number(item.q || item.quantity) || 1,
                            colorMode: "bw",
                            colorPages: 0,
                            useBinding: false,
                            coilId: ""
                        })) as OrderItem[]

                        setItems(newItems)
                        // Don't load draft if we have new items from URL
                        setIsLoaded(true)
                        return
                    }
                } catch (e) {
                    console.error("Failed to parse items from URL", e)
                }
            }
        }

        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft)
                setItems(draft.items || items)
                setCustomerId(draft.customerId || "")
                setManualPrice(draft.manualPrice || "")
                setPaidAmount(draft.paidAmount || "")
                toast.info("تم استعادة بيانات البيع السابق تلقائياً")
            } catch (e) {
                console.error("Failed to parse draft", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save draft whenever state changes
    useEffect(() => {
        if (isLoaded) {
            const draft = { items, customerId, manualPrice, paidAmount }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
        }
    }, [items, customerId, manualPrice, paidAmount, isLoaded])

    const clearDraft = () => {
        localStorage.removeItem(STORAGE_KEY)
        setItems([{
            id: Math.random().toString(),
            paperId: "",
            totalPages: 10,
            copies: 1,
            colorMode: "bw",
            colorPages: 0,
            useBinding: false,
            coilId: ""
        }])
        setCustomerId("")
        setManualPrice("")
        setPaidAmount("")
        toast.success("تم تصفير الحاسبة")
    }

    const addItem = () => {
        setItems([...items, {
            id: Math.random().toString(),
            paperId: "",
            totalPages: 10,
            copies: 1,
            colorMode: "bw",
            colorPages: 0,
            useBinding: false,
            coilId: ""
        }])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const updateItem = (id: string, updates: Partial<OrderItem>) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ))
    }

    const handleQuickAddCustomer = async () => {
        if (!newCustomerName) {
            toast.error("يرجى إدخال اسم العميل")
            return
        }

        setIsAddingCustomer(true)
        const result = await quickAddCustomer({
            name: newCustomerName,
            phone: newCustomerPhone
        })

        if (result.success && result.customer) {
            setCustomers([...customers, result.customer])
            setCustomerId(result.customer.id)
            setNewCustomerName("")
            setNewCustomerPhone("")
            setIsDialogOpen(false)
            toast.success("تم إضافة العميل واختياره بنجاح")
        } else {
            toast.error("فشل إضافة العميل: " + (result.error || "خطأ غير معروف"))
        }
        setIsAddingCustomer(false)
    }

    const { totalCost, itemsBreakdown } = useMemo(() => {
        const bwInkCost = Number(settings.default_bw_cost) || 0
        const colorInkCost = Number(settings.default_color_cost) || 0

        // Find cover costs from inventory
        const transparentCover = inventory.find(i => i.name === 'غلاف شفاف')
        const opaqueCover = inventory.find(i => i.name === 'غلاف معتم')
        const coverCostPerBinding = (transparentCover?.cost_per_unit || 0) + (opaqueCover?.cost_per_unit || 0)

        let total = 0
        const breakdown = items.map(item => {
            let itemCost = 0
            const paper = inventory.find(i => i.id === item.paperId)

            if (paper) {
                itemCost += paper.cost_per_unit * item.totalPages * item.copies
            }

            let inkTotal = 0
            if (item.colorMode === "bw") {
                inkTotal = bwInkCost * item.totalPages * item.copies
            } else if (item.colorMode === "color") {
                inkTotal = colorInkCost * item.totalPages * item.copies
            } else {
                const bwPages = Math.max(0, item.totalPages - item.colorPages)
                inkTotal = (bwInkCost * bwPages + colorInkCost * item.colorPages) * item.copies
            }
            itemCost += inkTotal

            if (item.useBinding) {
                const coil = inventory.find(i => i.id === item.coilId)
                const coilCost = coil ? coil.cost_per_unit : 0

                const totalBindingCost = coilCost + coverCostPerBinding
                itemCost += totalBindingCost * item.copies
            }

            total += itemCost
            return { ...item, cost: itemCost }
        })

        return { totalCost: total, itemsBreakdown: breakdown }
    }, [items, inventory, settings])

    const suggestedPrice = useMemo(() => {
        const margin = Number(settings.default_margin_percent) || 0
        return totalCost * (1 + margin / 100)
    }, [totalCost, settings])

    const finalPrice = manualPrice ? parseFloat(manualPrice) : suggestedPrice
    const currentPaid = paidAmount ? parseFloat(paidAmount) : finalPrice
    const remainingAmount = finalPrice - currentPaid
    const profit = finalPrice - totalCost

    async function handleRecordSale() {
        console.log("handleRecordSale started");

        if (!customerId) {
            toast.error("يرجى اختيار العميل أو المدرسة")
            return
        }

        const invalidItems = items.filter(item => !item.paperId)
        if (invalidItems.length > 0) {
            toast.error("يرجى اختيار نوع الورق لجميع العناصر")
            return
        }

        const parsedPaid = parseFloat(paidAmount)
        const currentPaidAmount = isNaN(parsedPaid) ? finalPrice : parsedPaid

        const priceMultiplier = finalPrice / (totalCost || 1)

        const saleData = {
            customerId,
            items: itemsBreakdown.map(item => ({
                paperId: item.paperId,
                totalPages: item.totalPages,
                copies: item.copies,
                colorMode: item.colorMode,
                colorPages: item.colorMode === "mixed" ? item.colorPages : (item.colorMode === "color" ? item.totalPages : 0),
                bwPages: item.colorMode === "mixed" ? (item.totalPages - item.colorPages) : (item.colorMode === "bw" ? item.totalPages : 0),
                useBinding: item.useBinding,
                coilId: item.coilId,
                costCalculated: item.cost,
                priceSold: item.cost * priceMultiplier
            })),
            totalCost,
            finalPrice,
            paidAmount: currentPaidAmount,
            status: 'completed'
        }

        console.log("Sending sale data:", saleData);

        try {
            const result = await createOrder(saleData)
            console.log("Server response:", result);

            if (result.success) {
                toast.success(saleData.status === 'partial_payment' ? "تم تسجيل البيع كـ (آجل) بنجاح" : "تم تسجيل عملية البيع بنجاح!")
                localStorage.removeItem(STORAGE_KEY)
                clearDraft()
                router.push("/orders")
            } else {
                toast.error("فشل تسجيل البيع: " + result.error)
            }
        } catch (error: any) {
            console.error("Error in handleRecordSale:", error);
            toast.error("حدث خطأ غير متوقع: " + error.message)
        }
    }

    if (!isLoaded) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={clearDraft} className="gap-2 text-muted-foreground hover:text-destructive transition-colors">
                    <RotateCcw className="h-4 w-4" />
                    تفريغ الحاسبة / تصفير
                </Button>
            </div>

            {/* Customer Selection Block */}
            <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-background border-r-4 border-r-emerald-500">
                <CardHeader className="py-3 md:py-4 px-4 md:px-6 border-b border-emerald-500/10">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                        <User className="h-5 w-5" />
                        صاحب عملية البيع
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:flex-1 space-y-2">
                            <Label className="text-sm font-semibold opacity-80">اسم العميل / المدرسة</Label>
                            <Select value={customerId} onValueChange={setCustomerId}>
                                <SelectTrigger className="h-11 bg-background border-emerald-500/20 hover:border-emerald-500 transition-colors">
                                    <SelectValue placeholder="اختر العميل المعني بالبيع..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.length > 0 ? (
                                        customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} {c.phone ? `| ${c.phone}` : ''}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground text-sm">لا يوجد عملاء مضافين</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-auto md:self-end">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="h-11 w-full gap-2 font-bold border-emerald-500/30 text-emerald-700 hover:bg-emerald-50">
                                        <Plus className="h-4 w-4" />
                                        عميل جديد
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>إضافة عميل جديد</DialogTitle>
                                        <DialogDescription>أدخل بيانات العميل ليتم تسجيل البيع باسمه.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">الاسم</Label>
                                            <Input id="name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">الهاتف</Label>
                                            <Input id="phone" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} dir="ltr" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleQuickAddCustomer} disabled={isAddingCustomer} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                            {isAddingCustomer ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : "إضافة واختيار"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((item, index) => (
                            <Card key={item.id} className="group relative flex flex-col h-full overflow-hidden border-2 border-muted transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg rounded-2xl bg-card">
                                <div className="bg-muted/40 p-3 flex items-center justify-between border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-black">
                                            {index + 1}
                                        </div>
                                        <span className="text-[13px] font-bold">عنصر البيع {index + 1}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <CardContent className="p-4 md:p-5 space-y-4 flex-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-muted-foreground">نوع الورق المباع</Label>
                                        <Select value={item.paperId} onValueChange={(value) => updateItem(item.id, { paperId: value })}>
                                            <SelectTrigger className="h-9 text-xs bg-muted/20 border-none hover:bg-muted transition-colors rounded-xl">
                                                <SelectValue placeholder="اختر الورق" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {inventory.filter(i => i.type === 'paper').map((p) => (
                                                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5 p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                            <Label className="text-[10px] font-bold text-emerald-600 text-center block">الصفحات</Label>
                                            <Input type="number" value={item.totalPages} onChange={(e) => updateItem(item.id, { totalPages: parseInt(e.target.value) || 0 })} className="h-7 text-xs border-none shadow-none text-center font-bold bg-transparent focus-visible:ring-0" />
                                        </div>
                                        <div className="space-y-1.5 p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                            <Label className="text-[10px] font-bold text-emerald-600 text-center block">الكمية/النسخ</Label>
                                            <Input type="number" value={item.copies} onChange={(e) => updateItem(item.id, { copies: parseInt(e.target.value) || 0 })} className="h-7 text-xs border-none shadow-none text-center font-bold bg-transparent focus-visible:ring-0" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-muted-foreground">نمط الطباعة</Label>
                                        <div className="flex p-1 bg-muted/40 rounded-xl gap-1">
                                            {(['bw', 'color', 'mixed'] as const).map((mode) => (
                                                <button key={mode} type="button" onClick={() => updateItem(item.id, { colorMode: mode })} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all", item.colorMode === mode ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 font-black" : "text-muted-foreground hover:bg-muted")}>
                                                    {mode === 'bw' ? 'أسود' : mode === 'color' ? 'ملوان' : 'مختلط'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {item.colorMode === "mixed" && (
                                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100">
                                                <Label className="text-[10px] font-bold text-emerald-700 mb-1 block">عدد الملون:</Label>
                                                <Input type="number" max={item.totalPages} value={item.colorPages} onChange={(e) => updateItem(item.id, { colorPages: parseInt(e.target.value) || 0 })} className="h-7 text-xs bg-white dark:bg-background" />
                                            </div>
                                        </div>
                                    )}

                                    <div className={cn("p-3 rounded-xl border transition-all duration-300", item.useBinding ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/10 border-muted")}>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[11px] font-bold flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> معه تكعيب</Label>
                                            <Switch checked={item.useBinding} onCheckedChange={(val) => updateItem(item.id, { useBinding: val })} className="scale-75" />
                                        </div>
                                        {item.useBinding && (
                                            <div className="mt-3 pt-3 border-t border-emerald-500/10 animate-in zoom-in-95 duration-300 origin-top">
                                                <Label className="text-[10px] opacity-70 mb-1 block">اختر مقاس/نوع السلك</Label>
                                                <Select value={item.coilId} onValueChange={(val) => updateItem(item.id, { coilId: val })}>
                                                    <SelectTrigger className="h-8 text-xs bg-white dark:bg-background border-none">
                                                        <SelectValue placeholder="اختر السلك" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {inventory.filter(i => i.type === 'binding').map(b => (
                                                            <SelectItem key={b.id} value={b.id} className="text-xs">
                                                                {b.name} (EGP {b.cost_per_unit})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 p-2 text-center border-t flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold opacity-60 text-emerald-700">تكلفة البند</span>
                                    <span className="text-sm font-black text-emerald-600">EGP {itemsBreakdown[index]?.cost.toFixed(2) || '0.00'}</span>
                                </CardFooter>
                            </Card>
                        ))}

                        <button onClick={addItem} className="h-full min-h-[350px] border-2 border-dashed border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-300">
                            <div className="h-14 w-14 rounded-full bg-muted group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-90"><Plus className="h-8 w-8" /></div>
                            <div className="text-center">
                                <p className="font-black text-lg group-hover:text-emerald-600 transition-colors">إضافة حركة بيع أخرى</p>
                                <p className="text-xs text-muted-foreground font-medium">تسجيل عملية بيع مضافة لنفس السجل</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="lg:sticky lg:top-8 h-fit">
                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden border-t-8 border-t-emerald-600">
                        <CardHeader className="bg-emerald-600 text-white p-5 md:p-6">
                            <CardTitle className="flex items-center gap-3 text-lg md:text-xl font-black">
                                <TrendingUp className="h-6 w-6" />
                                ملخص عملية البيع
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/40 rounded-2xl text-center flex flex-col">
                                    <span className="text-[11px] font-bold text-muted-foreground mb-1">إجمالي التكلفة</span>
                                    <span className="text-lg font-black font-mono text-zinc-700">{totalCost.toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl text-center flex flex-col border border-emerald-100">
                                    <span className="text-[11px] font-bold text-emerald-700 mb-1">السعر المقترح</span>
                                    <span className="text-lg font-black font-mono text-emerald-600">{suggestedPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator className="bg-emerald-100/50" />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" /> إجمالي سعر البيع المتفق عليه
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder={suggestedPrice.toFixed(2)}
                                            value={manualPrice}
                                            onChange={(e) => setManualPrice(e.target.value)}
                                            className="h-12 text-xl font-black border-2 border-emerald-500/20 focus:border-emerald-500 rounded-xl bg-background pr-12"
                                            dir="ltr"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-emerald-600 font-bold text-sm">EGP</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                                        <Wallet className="h-4 w-4" /> المبلغ المستلم (الكاش)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder={finalPrice.toFixed(2)}
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(e.target.value)}
                                            className="h-12 text-xl font-black border-2 border-emerald-500/20 focus:border-emerald-500 rounded-xl bg-emerald-50/50 pr-12"
                                            dir="ltr"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-emerald-600 font-bold text-sm">EGP</div>
                                    </div>
                                </div>

                                {remainingAmount > 0 ? (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 rounded-xl animate-in zoom-in-95">
                                        <div className="flex justify-between items-center text-amber-800 dark:text-amber-400">
                                            <span className="text-xs font-bold flex items-center gap-1">المبلغ المتبقي (دين/آجل):</span>
                                            <span className="text-lg font-black font-mono">{remainingAmount.toFixed(2)} EGP</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 rounded-xl text-center">
                                        <span className="text-xs font-bold text-emerald-700">تم دفع المبلغ بالكامل كاش ✅</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-zinc-900 text-white p-5 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">صافي الربح الإجمالي</span>
                                    <span className={`text-2xl font-black ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {profit >= 0 ? '+' : ''}{profit.toFixed(2)} EGP
                                    </span>
                                </div>
                            </div>

                            <Button onClick={handleRecordSale} className="w-full h-16 text-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all rounded-2xl active:scale-95">
                                <Save className="ml-2 h-6 w-6" />
                                {remainingAmount > 0 ? "تسجيل مبيعة (آجل/دين)" : "تسجيل مبيعة (كاش)"}
                            </Button>
                        </CardContent>
                    </Card>
                    <p className="mt-4 text-[11px] text-center text-muted-foreground font-medium px-6">
                        * سيتم خصم الخامات من المخزون فور الحفظ. في حالة الآجل، سيتم تسجيل المبلغ المتبقي كدين على العميل.
                    </p>
                </div>
            </div>
        </div>
    )
}
