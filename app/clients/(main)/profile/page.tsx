import { getProfile } from '@/app/clients/profile/actions'
import { ProfileForm } from '@/components/clients/profile-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const profile = await getProfile()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">الحساب الشخصي</h1>
                    <p className="text-sm text-muted-foreground">قم بتحديث معلوماتك الشخصية</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>معلومات الحساب</CardTitle>
                    <CardDescription>
                        يمكنك تعديل اسمك، رقم الهاتف، ورقم الواتساب
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm profile={profile} />
                </CardContent>
            </Card>
        </div>
    )
}
