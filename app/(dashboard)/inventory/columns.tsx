"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InventoryItem, deleteInventoryItem } from "./actions"
import { InventoryForm } from "./inventory-form"
import { toast } from "sonner"
import { ArrowUpDown, MoreHorizontal, Copy, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<InventoryItem>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent font-bold"
                >
                    الاسم
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "type",
        header: () => <div className="font-bold">النوع</div>,
    },
    {
        accessorKey: "quantity",
        header: () => <div className="font-bold text-center">الكمية</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>
    },
    {
        accessorKey: "cost_per_unit",
        header: () => <div className="font-bold text-center">تكلفة الوحدة</div>,
        cell: ({ row }) => {
            return <div className="text-center font-mono">EGP {row.getValue("cost_per_unit")}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100">
                            <span className="sr-only">افتح القائمة</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] font-bold">
                        <DropdownMenuLabel className="text-right opacity-50 text-xs">إجراءات الصنف</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(item.id)
                                toast.success("تم نسخ معرف الصنف")
                            }}
                            className="text-right justify-end gap-2"
                        >
                            نسخ المعرف
                            <Copy className="h-3.5 w-3.5" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <InventoryForm
                            initialItem={item}
                            trigger={
                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-right justify-end gap-2 w-full">
                                    تعديل الصنف
                                    <Edit className="h-3.5 w-3.5" />
                                </div>
                            }
                        />

                        <DropdownMenuItem onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذا الصنف نهائياً؟')) {
                                const result = await deleteInventoryItem(item.id)
                                if (result.message.includes('successfully')) {
                                    toast.success("تم حذف الصنف بنجاح")
                                } else {
                                    toast.error("فشل الحذف: " + result.message)
                                }
                            }
                        }} className="text-red-600 font-bold text-right justify-end gap-2">
                            حذف الصنف
                            <Trash2 className="h-3.5 w-3.5" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
