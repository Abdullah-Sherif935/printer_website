import { getInventory } from "./actions"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { InventoryForm } from "./inventory-form"

export default async function InventoryPage() {
    const data = await getInventory()

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <InventoryForm />
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
