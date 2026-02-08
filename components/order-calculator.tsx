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

        // Paper Cost
        const paperCost = paper ? paper.cost_per_unit : 0
        totalCost += paperCost * totalPages * copies

        // Ink Cost
        let inkCost = 0
        if (colorMode === "bw") {
            inkCost = settings.default_bw_cost * totalPages * copies
        } else if (colorMode === "color") {
            inkCost = settings.default_color_cost * totalPages * copies
        } else {
            // Mixed
            const bwPages = totalPages - colorPages
            inkCost = (settings.default_bw_cost * bwPages + settings.default_color_cost * colorPages) * copies
        }
        totalCost += inkCost

        // Binding Cost
        if (binding) {
            totalCost += binding.cost_per_unit * copies // Assuming 1 binding per copy
        }

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
            toast.error("Please select a paper type")
            return
        }

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
        if (result.success) {
            toast.success("Order created successfully!")
            router.push("/orders")
        } else {
            toast.error("Failed to create order: " + result.error)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Paper Type</Label>
                            <Select value={paperId} onValueChange={setPaperId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Paper" />
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
                            <Label>Binding</Label>
                            <Select value={bindingId} onValueChange={setBindingId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="No Binding" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
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
                            <Label>Total Pages (per copy)</Label>
                            <Input
                                type="number"
                                min="1"
                                value={totalPages}
                                onChange={(e) => setTotalPages(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Copies</Label>
                            <Input
                                type="number"
                                min="1"
                                value={copies}
                                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Color Mode</Label>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={colorMode === "bw" ? "default" : "outline"}
                                onClick={() => setColorMode("bw")}
                                size="sm"
                            >
                                B&W Only
                            </Button>
                            <Button
                                variant={colorMode === "color" ? "default" : "outline"}
                                onClick={() => setColorMode("color")}
                                size="sm"
                            >
                                All Color
                            </Button>
                            <Button
                                variant={colorMode === "mixed" ? "default" : "outline"}
                                onClick={() => setColorMode("mixed")}
                                size="sm"
                            >
                                Mixed
                            </Button>
                        </div>
                    </div>

                    {colorMode === "mixed" && (
                        <div className="space-y-2">
                            <Label>Color Pages Count</Label>
                            <Input
                                type="number"
                                min="0"
                                max={totalPages}
                                value={colorPages}
                                onChange={(e) => setColorPages(parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">
                                B&W Pages: {totalPages - colorPages}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-muted/10 border-2 border-primary/20">
                <CardHeader>
                    <CardTitle>Cost & Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span>Estimated Cost:</span>
                        <span className="font-mono font-medium">${cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Suggested Price ({settings.default_margin_percent}% margin):</span>
                        <span className="font-mono">${suggestedPrice.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Final Selling Price</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
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
                            <span>Net Profit</span>
                            <span>${profit.toFixed(2)}</span>
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full" onClick={handleSubmit}>
                        Create Order
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
