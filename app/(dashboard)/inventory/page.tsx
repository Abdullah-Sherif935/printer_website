import { getInventory } from "./actions"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { InventoryForm } from "./inventory-form"
import { Suspense } from "react"

export default async function InventoryPage() {
    const data = await getInventory()

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-800">إدارة المخزن</h2>
                    <p className="text-muted-foreground mt-1 text-sm">متابعة كميات الورق، الأحبار، ومستلزمات الطباعة.</p>
                </div>
                <InventoryForm />
            </div>
            <Suspense fallback={<div className="h-32 flex items-center justify-center font-bold text-muted-foreground">جاري تحميل المخزون...</div>}>
                <DataTable columns={columns} data={data} />
            </Suspense>
        </div>
    )
}
