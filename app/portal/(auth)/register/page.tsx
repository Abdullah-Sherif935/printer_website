'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { signup } from '../../actions'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

export default function PortalRegisterPage() {
    const [loading, setLoading] = useState(false)

    async function handleSignup(formData: FormData) {
        setLoading(true)
        const result = await signup(formData)
        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md shadow-xl border-none my-8">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-sm p-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={64}
                            height={64}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl font-black text-gray-800">إنشاء حساب جديد</CardTitle>
                    <CardDescription>سجل بياناتك للبدء في إرسال طلبات الطباعة</CardDescription>
                </CardHeader>
                <form action={handleSignup}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">الاسم بالكامل</Label>
                            <Input id="fullName" name="fullName" placeholder="الاسم الثلاثي" required className="h-11" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <Input id="phone" name="phone" placeholder="01xxxxxxxxx" required className="h-11" dir="ltr" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">رقم الواتساب</Label>
                                <Input id="whatsapp" name="whatsapp" placeholder="01xxxxxxxxx" required className="h-11" dir="ltr" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" required className="h-11" dir="ltr" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input id="password" name="password" type="password" required className="h-11" dir="ltr" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            لديك حساب بالفعل؟ <Link href="/portal/login" className="text-emerald-600 font-bold hover:underline">تسجيل الدخول</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
