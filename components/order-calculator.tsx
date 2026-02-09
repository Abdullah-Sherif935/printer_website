"use client"

import { useState, useEffect, useMemo } from "react"
import { InventoryItem } from "@/app/(dashboard)/inventory/actions"
import { SettingsMap } from "@/app/(dashboard)/settings/actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createOrder } from "@/app/(dashboard)/orders/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface OrderCalculatorProps {
    inventory: InventoryItem[]
    settings: SettingsMap
}

export function OrderCalculator({ inventory, settings }: OrderCalculatorProps) {
    const router = useRouter()

    // State
    const [paperId, setPaperId] = useState<string>("")
    const [bindingId, setBindingId] = useState<string>("none")
    const [totalPages, setTotalPages] = useState<number>(1)
    const [copies, setCopies] = useState<number>(1)
    const [colorMode, setColorMode] = useState<"bw" | "color" | "mixed">("bw")
    const [colorPages, setColorPages] = useState<number>(0) // Only used if mixed
    const [manualPrice, setManualPrice] = useState<string>("") // Override

    // Derived Values
    const paper = inventory.find((i) => i.id === paperId)
    const binding = inventory.find((i) => i.id === bindingId)

    // Calculations
    const cost = useMemo(() => {
        let totalCost = 0

        // Ensure settings have valid values
        const bwCost = Number(settings.default_bw_cost) || 0.5
        const colorCost = Number(settings.default_color_cost) || 2.0

        // Paper Cost
        const paperCost = paper ? paper.cost_per_unit : 0
        totalCost += paperCost * totalPages * copies

        // Ink Cost
        let inkCost = 0
        if (colorMode === "bw") {
            inkCost = bwCost * totalPages * copies
        } else if (colorMode === "color") {
            inkCost = colorCost * totalPages * copies
        } else {
            // Mixed
            const bwPages = totalPages - colorPages
            inkCost = (bwCost * bwPages + colorCost * colorPages) * copies
        }
        totalCost += inkCost

        // Binding Cost
        if (binding) {
            totalCost += binding.cost_per_unit * copies // Assuming 1 binding per copy
        }

        console.log('Order Calculation:', {
            totalPages,
            copies,
            paperCost,
            inkCost,
            totalCost,
            settings: { bwCost, colorCost }
        })

        return totalCost
    }, [paper, binding, totalPages, copies, colorMode, colorPages, settings])

    const suggestedPrice = useMemo(() => {
        const margin = settings.default_margin_percent / 100
        return cost * (1 + margin)
    }, [cost, settings])

    const finalPrice = manualPrice ? parseFloat(manualPrice) : suggestedPrice
    const profit = finalPrice - cost

    async function handleSubmit() {
        if (!paperId) {
            toast.error("يرجى اختيار نوع الورق")
            return
        }

        console.log('Submitting order with:', {
            paperId,
            bindingId,
            totalPages,
            copies,
            colorMode,
            cost,
            finalPrice
        })

        const orderData = {
            paperId,
            bindingId: bindingId === "none" ? null : bindingId,
            totalPages,
            copies,
            colorMode,
            colorPages: colorMode === "mixed" ? colorPages : (colorMode === "color" ? totalPages : 0),
            bwPages: colorMode === "mixed" ? (totalPages - colorPages) : (colorMode === "bw" ? totalPages : 0),
            totalCost: cost,
            finalPrice: finalPrice,
        }

        const result = await createOrder(orderData)
        console.log('Create order result:', result)

        if (result.success) {
            toast.success("تم إنشاء الطلب بنجاح!")
            router.push("/orders")
        } else {
            toast.error("فشل إنشاء الطلب: " + result.error)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>تفاصيل الطلب</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>نوع الورق</Label>
                            <Select value={paperId} onValueChange={setPaperId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الورق" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inventory.filter(i => i.type === 'paper').map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name} (${item.cost_per_unit}/sheet)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>التغليف</Label>
                            <Select value={bindingId} onValueChange={setBindingId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="بدون تغليف" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">بدون</SelectItem>
                                    {inventory.filter(i => i.type === 'binding').map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name} (${item.cost_per_unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>إجمالي الصفحات (لكل نسخة)</Label>
                            <Input
                                type="number"
                                min="1"
                                value={totalPages}
                                onChange={(e) => setTotalPages(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>عدد النسخ</Label>
                            <Input
                                type="number"
                                min="1"
                                value={copies}
                                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>نوع الطباعة</Label>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={colorMode === "bw" ? "default" : "outline"}
                                onClick={() => setColorMode("bw")}
                                size="sm"
                            >
                                أبيض وأسود
                            </Button>
                            <Button
                                variant={colorMode === "color" ? "default" : "outline"}
                                onClick={() => setColorMode("color")}
                                size="sm"
                            >
                                ألوان فقط
                            </Button>
                            <Button
                                variant={colorMode === "mixed" ? "default" : "outline"}
                                onClick={() => setColorMode("mixed")}
                                size="sm"
                            >
                                مختلط
                            </Button>
                        </div>
                    </div>

                    {colorMode === "mixed" && (
                        <div className="space-y-2">
                            <Label>عدد صفحات الألوان</Label>
                            <Input
                                type="number"
                                min="0"
                                max={totalPages}
                                value={colorPages}
                                onChange={(e) => setColorPages(parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">
                                صفحات أبيض وأسود: {totalPages - colorPages}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-muted/10 border-2 border-primary/20">
                <CardHeader>
                    <CardTitle>التكلفة والتسعير</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span>التكلفة التقديرية:</span>
                        <span className="font-mono font-medium">EGP {cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>السعر المقترح ({settings.default_margin_percent}% هامش ربح):</span>
                        <span className="font-mono">EGP {suggestedPrice.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">سعر البيع النهائي</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">EGP</span>
                            <Input
                                className="pl-7 text-lg font-bold"
                                value={manualPrice}
                                placeholder={suggestedPrice.toFixed(2)}
                                onChange={(e) => setManualPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg bg-green-100 p-3 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <div className="flex justify-between font-bold">
                            <span>صافي الربح</span>
                            <span>EGP {profit.toFixed(2)}</span>
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full" onClick={handleSubmit}>
                        إنشاء الطلب
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
