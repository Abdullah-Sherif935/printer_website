"use client"

import { useState } from "react"
import { SettingsMap, updateSettings } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

import { Textarea } from "@/components/ui/textarea"

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
        if (key.startsWith('whatsapp_') || key.startsWith('notification_') || key === 'contact_phone') {
            setSettings(prev => ({ ...prev, [key]: value }))
        } else {
            setSettings(prev => ({ ...prev, [key]: value === "" ? undefined : parseFloat(value) }))
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>أرقام التواصل</CardTitle>
                    <CardDescription>
                        حدد أرقام التواصل التي تظهر في الأزرار العائمة للعملاء.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>رقم الواتساب</Label>
                            <Input
                                value={settings.whatsapp_number || ''}
                                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                                dir="ltr"
                                placeholder="مثلاً: 01030360804"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>رقم الإتصال الهاتفي</Label>
                            <Input
                                value={settings.contact_phone || ''}
                                onChange={(e) => handleChange('contact_phone', e.target.value)}
                                dir="ltr"
                                placeholder="مثلاً: 01030360804"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>رسائل الواتساب التلقائية</CardTitle>
                    <CardDescription>
                        تخصيص الرسائل التي يتم إرسالها للعملاء عند تغيير حالة الطلب.
                        <br />
                        <span className="text-xs text-muted-foreground">يمكنك استخدام <strong>{'{customer_name}'}</strong> كمتغير لاسم العميل.</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>رسالة "جاري التنفيذ" (عند استلام الطلب)</Label>
                        <Textarea
                            value={settings.whatsapp_msg_processing || ''}
                            onChange={(e) => handleChange('whatsapp_msg_processing', e.target.value)}
                            dir="auto"
                            className="min-h-[80px]"
                            placeholder="مرحباً {customer_name}، تم استلام طلبك..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>رسالة "تم الانتهاء" (عند جاهزية الطلب)</Label>
                        <Textarea
                            value={settings.whatsapp_msg_completed || ''}
                            onChange={(e) => handleChange('whatsapp_msg_completed', e.target.value)}
                            dir="auto"
                            className="min-h-[80px]"
                            placeholder="مرحباً {customer_name}، طلبك جاهز..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>إشعارات النظام (داخل الموقع)</CardTitle>
                    <CardDescription>
                        تخصيص نص الإشعارات المختصرة التي تظهر للمستخدم في الموقع.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>إشعار "جاري التنفيذ"</Label>
                        <Textarea
                            value={settings.notification_msg_processing || ''}
                            onChange={(e) => handleChange('notification_msg_processing', e.target.value)}
                            dir="auto"
                            className="min-h-[80px]"
                            placeholder="مرحباً {customer_name}، تم استلام طلبك..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>إشعار "جاهز للاستلام"</Label>
                        <Textarea
                            value={settings.notification_msg_completed || ''}
                            onChange={(e) => handleChange('notification_msg_completed', e.target.value)}
                            dir="auto"
                            className="min-h-[80px]"
                            placeholder="مرحباً {customer_name}، طلبك جاهز..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>إشعار "تم التسليم"</Label>
                        <Textarea
                            value={settings.notification_msg_delivered || ''}
                            onChange={(e) => handleChange('notification_msg_delivered', e.target.value)}
                            dir="auto"
                            className="min-h-[80px]"
                            placeholder="مرحباً {customer_name}، شكراً لثقتكم..."
                        />
                    </div>
                </CardContent>
            </Card>

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

            <Card>
                <CardHeader>
                    <CardTitle>أسعار الطباعة للعملاء</CardTitle>
                    <CardDescription>
                        حدد الأسعار التي تظهر للعميل عند حساب التكلفة التقديرية.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>أبيض وأسود (وجه واحد)</Label>
                            <Input
                                type="number" step="0.25"
                                value={settings.bw_single_price ?? 0}
                                onChange={(e) => handleChange('bw_single_price', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>أبيض وأسود (وجهين - للورقة)</Label>
                            <Input
                                type="number" step="0.25"
                                value={settings.bw_double_price ?? 0}
                                onChange={(e) => handleChange('bw_double_price', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ألوان (وجه واحد)</Label>
                            <Input
                                type="number" step="0.5"
                                value={settings.color_single_price ?? 0}
                                onChange={(e) => handleChange('color_single_price', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ألوان (وجهين - للورقة)</Label>
                            <Input
                                type="number" step="0.5"
                                value={settings.color_double_price ?? 0}
                                onChange={(e) => handleChange('color_double_price', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>إعدادات التكعيب</CardTitle>
                    <CardDescription>
                        حدد تكلفة التكعيب بناءً على عدد الورق.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>حد عدد الورق الفاصل</Label>
                            <Input
                                type="number"
                                value={settings.binding_threshold ?? 100}
                                onChange={(e) => handleChange('binding_threshold', e.target.value)}
                                dir="ltr"
                                placeholder="مثلاً 100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>التكلفة للعدد الأقل</Label>
                            <Input
                                type="number" step="1"
                                value={settings.binding_small_cost ?? 0}
                                onChange={(e) => handleChange('binding_small_cost', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>التكلفة للعدد الأكبر</Label>
                            <Input
                                type="number" step="1"
                                value={settings.binding_large_cost ?? 0}
                                onChange={(e) => handleChange('binding_large_cost', e.target.value)}
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
