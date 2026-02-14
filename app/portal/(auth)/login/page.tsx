'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '../../actions'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

export default function PortalLoginPage() {
    const [loading, setLoading] = useState(false)

    async function handleLogin(formData: FormData) {
        setLoading(true)
        const result = await login(formData)
        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-sm p-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={80}
                            height={80}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl font-black text-gray-800">بوابة العملاء</CardTitle>
                    <CardDescription>تسجيل الدخول لمتابعة طلبات الطباعة</CardDescription>
                </CardHeader>
                <form action={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">كلمة المرور</Label>
                            </div>
                            <Input id="password" name="password" type="password" required className="h-11" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            ليس لديك حساب؟ <Link href="/portal/register" className="text-emerald-600 font-bold hover:underline">إنشاء حساب جديد</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
