import { getCustomers } from './actions'
import { CustomersTable } from './customers-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function CustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">العملاء</h2>
                <Link href="/customers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        إضافة عميل
                    </Button>
                </Link>
            </div>
            <CustomersTable customers={customers} />
        </div>
    )
}
