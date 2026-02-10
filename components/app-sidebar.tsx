"use client"

import * as React from "react"
import {
    Home,
    ShoppingCart,
    Package,
    Receipt,
    Users,
    Settings,
    TrendingUp,
    Printer,
    ListTodo
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
    {
        title: "الرئيسية",
        url: "/",
        icon: Home,
    },
    {
        title: "تسجيل مبيعات",
        url: "/orders/new",
        icon: TrendingUp,
    },
    {
        title: "سجل المبيعات",
        url: "/orders",
        icon: ShoppingCart,
    },
    {
        title: "المخزون",
        url: "/inventory",
        icon: Package,
    },
    {
        title: "العملاء",
        url: "/customers",
        icon: Users,
    },
    {
        title: "قائمة المهام",
        url: "/active_orders",
        icon: ListTodo,
    },
    {
        title: "المصروفات",
        url: "/expenses",
        icon: Receipt,
    },
    {
        title: "الإعدادات",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar side="right" collapsible="icon">


            <SidebarHeader className="border-b px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-sm p-1">
                        <Image
                            src="/logo.png"
                            alt="PrintPOS Logo"
                            width={48}
                            height={48}
                            className="object-contain w-full h-full"
                            priority
                        />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="font-black text-lg">المهندس للطباعة</span>
                        <span className="text-xs text-muted-foreground">نظام إدارة المطبعة</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.url ||
                                    (item.url !== "/" && pathname.startsWith(item.url))

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url} className="font-bold">
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <div className="text-xs text-muted-foreground text-center">
                    نسخة 1.0.0
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
