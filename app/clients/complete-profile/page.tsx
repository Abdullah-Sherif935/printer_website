import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { completeProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function CompleteProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/clients/login')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">استكمال البيانات</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">يرجى إدخال بيانات التواصل لاستخدام خدمات الموقع</p>
                </div>

                <form action={completeProfile} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">الاسم بالكامل</Label>
                        <Input id="fullName" name="fullName" required placeholder="الاسم الثلاثي" defaultValue={user.user_metadata?.full_name || ''} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input id="phone" name="phone" required placeholder="01xxxxxxxx" dir="ltr" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">رقم الواتساب</Label>
                        <Input id="whatsapp" name="whatsapp" required placeholder="01xxxxxxxx" dir="ltr" />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        حفظ ومتابعة
                    </Button>
                </form>
            </div>
        </div>
    )
}
