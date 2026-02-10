import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, Plus, FileText, User } from 'lucide-react'
import Image from 'next/image'

export default async function PortalMainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/portal/login')
    }

    // Verify role is customer (optional, or redirect admins to dashboard)
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    // if (profile?.role === 'admin') redirect('/')

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <header className="bg-white border-b sticky top-0 z-10 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/portal" className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-lg border">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <span className="font-black text-lg hidden sm:inline-block">المهندس للطباعة</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/portal/new">
                        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">طلب جديد</span>
                        </Button>
                    </Link>

                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" size="icon" title="تسجيل الخروج">
                            <LogOut className="w-5 h-5 text-gray-500 hover:text-red-600" />
                        </Button>
                    </form>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-6 max-w-5xl">
                {children}
            </main>

            <footer className="bg-white border-t p-4 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} المهندس للطباعة - جميع الحقوق محفوظة
            </footer>
        </div>
    )
}
