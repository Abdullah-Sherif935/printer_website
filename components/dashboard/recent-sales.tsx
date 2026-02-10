import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentSales({ sales }: { sales: any[] }) {
    return (
        <div className="space-y-8">
            {sales.map((sale) => (
                <div className="flex items-center gap-4" key={sale.id}>
                    <Avatar className="h-10 w-10 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold">{sale.customers?.name?.slice(0, 2).toUpperCase() || 'عم'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold leading-none text-zinc-800 dark:text-zinc-200">{sale.customers?.name || 'عميل سريع'}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                                {sale.customers?.phone || 'بدون هاتف'}
                            </p>
                            <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-60 uppercase">{sale.status}</Badge>
                        </div>
                    </div>
                    <div className="font-black text-sm md:text-base text-emerald-600">
                        EGP {sale.total_amount.toFixed(2)}
                    </div>
                </div>
            ))}
            {sales.length === 0 && <div className="text-sm text-muted-foreground">No recent sales.</div>}
        </div>
    )
}
