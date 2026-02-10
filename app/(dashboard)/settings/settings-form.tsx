"use client"

import { useState } from "react"
import { SettingsMap, updateSettings } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export function SettingsForm({ initialSettings }: { initialSettings: SettingsMap }) {
    const [settings, setSettings] = useState<SettingsMap>(initialSettings)

    async function handleSubmit() {
        const result = await updateSettings(settings)
        if (result.success) {
            toast.success("تم تحديث الإعدادات بنجاح")
        } else {
            toast.error("فشل تحديث الإعدادات: " + result.error)
        }
    }

    const handleChange = (key: keyof SettingsMap, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value === "" ? undefined : parseFloat(value) }))
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>إعدادات الطباعة الأساسية</CardTitle>
                    <CardDescription>
                        اضبط التكاليف الافتراضية للورق والحبر وهامش الربح.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>تكلفة الحبر أبيض وأسود (للورقة)</Label>
                            <Input
                                type="number" step="0.01"
                                value={settings.default_bw_cost ?? 0}
                                onChange={(e) => handleChange('default_bw_cost', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>تكلفة الحبر ملوان (للورقة)</Label>
                            <Input
                                type="number" step="0.01"
                                value={settings.default_color_cost ?? 0}
                                onChange={(e) => handleChange('default_color_cost', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>هامش الربح الافتراضي (%)</Label>
                            <Input
                                type="number"
                                value={settings.default_margin_percent ?? 0}
                                onChange={(e) => handleChange('default_margin_percent', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-6">
                <Button onClick={handleSubmit} className="w-full h-12 text-lg font-black bg-zinc-900 hover:bg-zinc-800 transition-all active:scale-[0.98]">
                    حفظ كل الإعدادات
                </Button>
            </div>
        </div>
    )
}
