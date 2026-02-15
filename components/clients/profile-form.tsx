"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/clients/profile/actions'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ProfileForm({ profile }: { profile: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        whatsapp_number: profile?.whatsapp_number || ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const result = await updateProfile(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('تم تحديث البيانات بنجاح!')
            router.refresh()
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor="full_name" className="text-base font-bold text-gray-900 dark:text-gray-100">الاسم الكامل</Label>
                <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    required
                    className="h-11 text-base font-medium bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="phone_number" className="text-base font-bold text-gray-900 dark:text-gray-100">رقم الهاتف</Label>
                <Input
                    id="phone_number"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    dir="ltr"
                    className="h-11 text-base font-medium bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="whatsapp_number" className="text-base font-bold text-gray-900 dark:text-gray-100">رقم الواتساب</Label>
                <Input
                    id="whatsapp_number"
                    value={formData.whatsapp_number || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    dir="ltr"
                    className="h-11 text-base font-medium bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5">
                    سنستخدم هذا الرقم للتواصل معك عبر الواتساب
                </p>
            </div>

            <Button
                type="submit"
                className="w-full h-12 gap-2"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الحفظ...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4" />
                        حفظ التغييرات
                    </>
                )}
            </Button>
        </form>
    )
}
