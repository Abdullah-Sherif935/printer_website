"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createActiveOrder } from "@/app/(dashboard)/active_orders/actions"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

// Define Schema
const activeOrderSchema = z.object({
    customerName: z.string().min(2, "الاسم مطلوب"),
    customerPhone: z.string().min(10, "رقم الهاتف غير صحيح"),
    items: z.array(z.object({
        detail: z.string().min(2, "التفاصيل مطلوبة"),
        paperCount: z.coerce.number().optional(),
        quantity: z.coerce.number().min(1, "الكمية مطلوبة")
    })).min(1, "يجب إضافة صنف واحد على الأقل"),
    notes: z.string().optional()
})

type ActiveOrderValues = z.infer<typeof activeOrderSchema>

export function ActiveOrderForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<ActiveOrderValues>({
        // Casting resolver to any to bypass strict internal type conflicts between RHF and Zod versions
        resolver: zodResolver(activeOrderSchema) as any,
        defaultValues: {
            customerName: "",
            customerPhone: "",
            items: [{ detail: "", quantity: 1, paperCount: undefined }],
            notes: ""
        },
        mode: "onChange"
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    })

    async function onSubmit(values: ActiveOrderValues) {
        setLoading(true)
        const result = await createActiveOrder({
            customer_name: values.customerName,
            customer_phone: values.customerPhone,
            items: values.items,
            notes: values.notes
        })

        if (result.success) {
            toast.success("تم إضافة الطلب للقائمة ✅")
            router.push("/active_orders")
            router.refresh()
        } else {
            toast.error("فشل في إضافة الطلب: " + result.error)
        }
        setLoading(false)
    }

    return (
        <Card className="max-w-2xl mx-auto border-none shadow-md">
            <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                    <span className="bg-primary text-white p-1 rounded-md"><Plus className="w-5 h-5" /></span>
                    إضافة طلب جديد لقائمة المهام
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">اسم العميل</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: أحمد محمد" {...field} className="h-11 font-semibold" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="customerPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">رقم الهاتف (للواتساب)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="01xxxxxxxxx" {...field} dir="ltr" type="tel" className="h-11 text-right font-mono" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-gray-300">
                            <div className="flex justify-between items-center mb-3">
                                <FormLabel className="font-bold text-lg text-gray-800">تفاصيل الطلبات</FormLabel>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => append({ detail: "", quantity: 1, paperCount: undefined })}
                                    className="gap-1 border-primary text-primary hover:bg-primary/10"
                                >
                                    <Plus className="w-4 h-4" /> إضافة صنف
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex-[2]">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.detail`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <Input placeholder="تفاصيل (مثال: طباعة مذكرة علوم...)" {...field} className="h-10" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="w-20 sm:w-24">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.paperCount`}
                                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="الورق"
                                                                title="عدد الورق الصافي"
                                                                {...fieldProps}
                                                                value={value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    onChange(val === '' ? undefined : Number(val));
                                                                }}
                                                                className="h-10 text-center text-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="w-20 sm:w-24">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <Input type="number" min="1" placeholder="نسخ" {...field} className="h-10 text-center font-bold" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        {fields.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 h-10 w-10 mt-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <FormMessage>{form.formState.errors.items?.root?.message}</FormMessage>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-700">ملاحظات إضافية (اختياري)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="التسليم غداً الساعة 2 ظهراً..." {...field} className="resize-none min-h-[80px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="submit" disabled={loading} className="flex-1 h-12 text-lg font-black bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md active:scale-95">
                                {loading ? "جاري الحفظ..." : "حفظ الطلب ✓"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()} className="h-12 w-24 font-bold">
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
