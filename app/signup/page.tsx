import { signUp } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage({
    searchParams,
}: {
    searchParams: { error?: string; message?: string }
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white shadow-md p-2">
                        <Image
                            src="/logo.png"
                            alt="PrintPOS Logo"
                            width={96}
                            height={96}
                            className="object-contain w-full h-full"
                            priority
                        />
                    </div>
                    <CardTitle className="text-3xl font-bold">إنشاء حساب جديد</CardTitle>
                    <CardDescription className="text-base mt-2">
                        سجل بياناتك للدخول في إرسال طلبات الطباعة
                    </CardDescription>
                </CardHeader>

                <form id="signup-form">
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-right block">الاسم بالكامل</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="الاسم الأول"
                                required
                                className="text-right"
                                dir="rtl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="01xxxxxxxxx"
                                    className="text-left"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-right block">رقم الواتساب</Label>
                                <Input
                                    id="whatsapp"
                                    name="whatsapp"
                                    type="tel"
                                    placeholder="01xxxxxxxxx"
                                    className="text-left"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="text-left"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-right block">كلمة المرور</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                            />
                        </div>

                        {searchParams.error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-sm text-right" dir="rtl">
                                ❌ {searchParams.error}
                            </div>
                        )}

                        {searchParams.message && (
                            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-sm text-right" dir="rtl">
                                ✅ {searchParams.message}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            form="signup-form"
                            formAction={signUp}
                            className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
                        >
                            إنشاء الحساب
                        </Button>

                        <p className="text-sm text-center text-muted-foreground">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-emerald-600 hover:underline font-semibold">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
