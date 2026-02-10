import { getCustomers } from './actions'
import { CustomersTable } from './customers-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function CustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-800">إدارة العملاء والمدارس</h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">قائمة بجميع العملاء الحاليين وأرصدتهم الحالية.</p>
                </div>
                <Link href="/customers/new" className="w-full sm:w-auto">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/20 gap-2 h-11 px-6 text-white rounded-xl">
                        <Plus className="h-5 w-5" /> إضافة عميل جديد
                    </Button>
                </Link>
            </div>
            <CustomersTable customers={customers} />
        </div>
    )
}
