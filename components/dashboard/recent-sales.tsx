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
                <div className="flex items-center" key={sale.id}>
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{sale.customers?.name?.slice(0, 2).toUpperCase() || 'WI'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.customers?.name || 'Walk-in Customer'}</p>
                        <p className="text-sm text-muted-foreground">
                            {sale.customers?.phone || 'No phone'}
                        </p>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-4 px-1">{sale.status}</Badge>
                        </div>
                    </div>
                    <div className="ml-auto font-medium">+${sale.total_amount}</div>
                </div>
            ))}
            {sales.length === 0 && <div className="text-sm text-muted-foreground">No recent sales.</div>}
        </div>
    )
}
