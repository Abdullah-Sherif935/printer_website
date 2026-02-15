"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, MessageCircle, Clock, CheckCircle2, MapPin, Navigation, PlayCircle, Package, Truck, Filter, BookOpen, FileText, UserCog, Layers, ArrowUpDown, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { markActiveOrderCompleted, markActiveOrderProcessing, markActiveOrderDelivered } from "@/app/(dashboard)/active_orders/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { useState } from "react"
// ... imports

import { SettingsMap } from "@/app/(dashboard)/settings/actions"

export function ActiveOrderList({ orders, isCompleted = false, settings }: { orders: any[], isCompleted?: boolean, settings?: SettingsMap }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'online_notebook' | 'online_print' | 'manual'>('all')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

    // Filter & Sort Logic
    const processedOrders = orders.filter(order => {
        if (filter === 'all') return true

        if (filter === 'manual') {
            return order.order_source !== 'online'
        }

        // Must be online for below filters
        if (order.order_source !== 'online') return false

        const hasNotebook = order.items?.some((i: any) => i.type === 'notebook' || i.subject || i.detail?.includes('دفتر') || i.detail?.includes('مذكرة'))

        if (filter === 'online_notebook') return hasNotebook
        if (filter === 'online_print') return !hasNotebook // If online and not notebook, assume print file

        return true
    }).sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    // Helper to get order type label
    const getOrderTypeLabel = (order: any) => {
        if (order.order_source !== 'online') {
            return (
                <Badge variant="outline" className="bg-amber-100/50 text-amber-700 border-amber-200 gap-1 absolute top-2 left-2 z-10">
                    <UserCog className="w-3 h-3" />
                    طلب يدوي (أدمن)
                </Badge>
            )
        }

        const hasNotebook = order.items?.some((i: any) => i.type === 'notebook' || i.subject || i.detail?.includes('دفتر') || i.detail?.includes('مذكرة'))

        if (hasNotebook) {
            return (
                <Badge variant="secondary" className="bg-purple-100/80 text-purple-700 border-purple-200 gap-1 absolute top-2 left-2 z-10 backdrop-blur-sm">
                    <BookOpen className="w-3 h-3" />
                    دفاتر تحضير
                </Badge>
            )
        }

        return (
            <Badge variant="secondary" className="bg-blue-100/80 text-blue-700 border-blue-200 gap-1 absolute top-2 left-2 z-10 backdrop-blur-sm">
                <FileText className="w-3 h-3" />
                ملفات طباعة
            </Badge>
        )
    }

    // Helper to format message
    const formatMessage = (template: string | undefined, customerName: string) => {
        if (!template) return ''
        return template.replace('{customer_name}', customerName || 'يا غالي')
    }

    // ========== Stage 1: استلام وبدء العمل ==========
    async function handleProcessing(order: any) {
        if (loadingId) return
        setLoadingId(order.id)

        const promise = async () => {
            try {
                await markActiveOrderProcessing(order.id)
                router.refresh()
                // Open WhatsApp
                const phone = order.customer_phone?.replace(/^0+/, '')
                if (phone) {
                    // Use settings message or fallback
                    const defaultMsg = "مرحباً {customer_name}، تم استلام طلبك وجاري العمل عليه. سنبلغك فور الانتهاء!"
                    const message = formatMessage(settings?.whatsapp_msg_processing || defaultMsg, order.customer_name)

                    window.open(`https://wa.me/20${phone}?text=${encodeURIComponent(message)}`, '_blank')
                }
            } finally {
                setLoadingId(null)
            }
        }

        toast.promise(promise(), {
            loading: 'جاري استلام الطلب...',
            success: 'تم الاستلام! تم إرسال إشعار للعميل.',
            error: (err) => {
                setLoadingId(null)
                return 'حدث خطأ'
            }
        })
    }

    // ========== Stage 2: تم انهاء الطلب ==========
    async function handleComplete(order: any) {
        if (loadingId) return
        setLoadingId(order.id)

        const promise = async () => {
            try {
                await markActiveOrderCompleted(order.id)
                router.refresh()
                // Open WhatsApp
                const phone = order.customer_phone?.replace(/^0+/, '')
                if (phone) {
                    // Use settings message or fallback
                    const defaultMsg = "مرحباً {customer_name}، تم الانتهاء من طلبك. يمكنك استلامه الآن!"
                    const message = formatMessage(settings?.whatsapp_msg_completed || defaultMsg, order.customer_name)

                    window.open(`https://wa.me/20${phone}?text=${encodeURIComponent(message)}`, '_blank')
                }
            } finally {
                setLoadingId(null)
            }
        }

        toast.promise(promise(), {
            loading: 'جاري إنهاء الطلب...',
            success: 'تم إنهاء الطلب! تم إرسال إشعار للعميل.',
            error: (err) => {
                setLoadingId(null)
                return 'حدث خطأ أثناء التحديث'
            }
        })
    }

    // ========== Stage 3: تم التسليم ==========
    async function handleDelivered(order: any) {
        if (loadingId) return
        setLoadingId(order.id)

        const promise = async () => {
            try {
                await markActiveOrderDelivered(order.id)

                // Prepare data for POS redirection
                const params = new URLSearchParams()
                params.set('source', 'active_orders')
                if (order.customer_name) params.set('customerName', order.customer_name)
                // Ensure phone is passed correctly, handling potential nulls
                const phone = order.customer_phone || ''
                if (phone) params.set('customerPhone', phone)

                if (order.items) {
                    const simpleItems = order.items.map((i: any) => ({
                        q: i.quantity,
                        p: i.paperCount,
                        d: i.detail
                    }))
                    params.set('items', JSON.stringify(simpleItems))
                }

                router.push(`/orders/new?${params.toString()}`)
                router.refresh()
            } catch (e) {
                setLoadingId(null)
                throw e
            }
            // Don't reset loadingId here to prevent clicks during navigation
        }

        toast.promise(promise(), {
            loading: 'جاري تسليم الطلب...',
            success: 'تم التسليم! جاري فتح شاشة البيع...',
            error: 'حدث خطأ'
        })
    }

    // ========== Status Badge Helper ==========
    function getStatusBadge(order: any) {
        const status = order.status
        if (isCompleted || status === 'delivered') {
            return (
                <Badge variant="outline" className="font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700">
                    <Package className="w-3 h-3" />
                    تم التسليم
                </Badge>
            )
        }
        if (status === 'completed') {
            return (
                <Badge variant="outline" className="font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    جاهز للاستلام
                </Badge>
            )
        }
        if (status === 'processing') {
            return (
                <Badge variant="outline" className="font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 animate-pulse">
                    <PlayCircle className="w-3 h-3" />
                    جاري التنفيذ
                </Badge>
            )
        }
        // pending
        return (
            <Badge variant="outline" className="font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                <Clock className="w-3 h-3" />
                انتظار
            </Badge>
        )
    }

    // ========== Status Bar Color Helper ==========
    function getStatusBarColor(order: any) {
        if (order.status === 'delivered') return 'bg-gray-400'
        if (order.status === 'completed') return 'bg-emerald-500'
        if (order.status === 'processing') return 'bg-blue-500'
        return 'bg-amber-500' // pending
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <div className="w-20 h-20 bg-emerald-100/50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600/50" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">لا توجد طلبات</h3>
                <p className="text-gray-500 mt-2 text-sm">أنت رائع! تم إنجاز العمل كله.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-zinc-800/50 rounded-xl w-fit">
                <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:bg-zinc-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white'}
                >
                    <Layers className="w-4 h-4 ml-2" />
                    الكل
                </Button>
                <Button
                    variant={filter === 'online_notebook' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('online_notebook')}
                    className={filter === 'online_notebook' ? 'bg-purple-600 text-white shadow-sm hover:bg-purple-700' : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-400'}
                >
                    <BookOpen className="w-4 h-4 ml-2" />
                    دفاتر تحضير
                </Button>
                <Button
                    variant={filter === 'online_print' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('online_print')}
                    className={filter === 'online_print' ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400'}
                >
                    <FileText className="w-4 h-4 ml-2" />
                    ملفات طباعة
                </Button>
                <Button
                    variant={filter === 'manual' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('manual')}
                    className={filter === 'manual' ? 'bg-amber-600 text-white shadow-sm hover:bg-amber-700' : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400'}
                >
                    <UserCog className="w-4 h-4 ml-2" />
                    طلبات يدوية
                </Button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center hidden sm:block"></div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400"
                >
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                    {sortOrder === 'desc' ? 'الأحـدث' : 'الأقـدم'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedOrders.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                        <Filter className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">لا توجد طلبات بهذا التصنيف</p>
                        <Button variant="link" onClick={() => setFilter('all')} className="mt-2 text-emerald-600">عرض الكل</Button>
                    </div>
                ) : (
                    processedOrders.map((order) => (
                        <Card key={order.id} className="relative group overflow-hidden border-2 border-transparent hover:border-emerald-500/20 transition-all duration-300 shadow-sm hover:shadow-lg bg-white dark:bg-zinc-900 rounded-2xl">


                            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-md ${getStatusBarColor(order)}`} />

                            {/* Order Type Label */}
                            {getOrderTypeLabel(order)}

                            <CardHeader className="pb-3 pt-5 px-5 flex flex-row justify-between items-start gap-2">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <CardTitle className="text-lg font-black text-gray-800 dark:text-gray-100 line-clamp-1">
                                            {order.customer_name}
                                        </CardTitle>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                                            <Calendar className="w-3 h-3" />
                                            <span dir="ltr">
                                                {order.created_at ? format(new Date(order.created_at), "dd/MM/yyyy hh:mm a", { locale: ar }) : '--'}
                                            </span>
                                        </div>

                                        <a
                                            href={`https://wa.me/20${order.customer_phone?.replace(/^0+/, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit transition-colors"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                            {order.customer_phone}
                                        </a>
                                    </div>
                                </div>
                                {getStatusBadge(order)}
                            </CardHeader>

                            <CardContent className="px-5 pb-4">
                                {/* Order Source Badge */}
                                {order.order_source === 'online' && (
                                    <div className="mb-3">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1">
                                            <Clock className="w-3 h-3" />
                                            طلب أونلاين
                                        </Badge>
                                    </div>
                                )}

                                <div className="space-y-2 mb-4">
                                    {order.items && Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                                            <span className="font-medium text-gray-700 dark:text-zinc-300 truncate max-w-[180px] flex items-center gap-2 before:content-['•'] before:text-emerald-500 before:mr-1">
                                                {item.detail}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {item.paperCount && Number(item.paperCount) > 0 && (
                                                    <span className="font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] border border-blue-100 dark:border-blue-800/50" title="عدد الورق الصافي">
                                                        {item.paperCount} ورقة
                                                    </span>
                                                )}
                                                <span className="font-black font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-zinc-400">x{item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Attached Files */}
                                {order.file_urls && Array.isArray(order.file_urls) && order.file_urls.length > 0 && (
                                    <div className="mb-4 space-y-2 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                                        <span className="text-xs font-bold text-slate-500 block">الملفات المرفقة:</span>
                                        {order.file_urls.map((url: string, i: number) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline truncate"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                                <span className="truncate" dir="ltr">File {i + 1}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {order.notes && (
                                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 text-xs text-amber-800/80 dark:text-amber-400 italic leading-relaxed">
                                        <span className="font-bold text-amber-700 dark:text-amber-500 not-italic block mb-1">ملاحظة:</span>
                                        {order.notes.split('\n').map((line: string, i: number) => {
                                            const mapLinkMatch = line.match(/(https:\/\/maps\.google\.com\/\?q=[^ ]+)/);
                                            if (mapLinkMatch) {
                                                return (
                                                    <Button
                                                        key={i}
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full mt-2 h-8 text-xs border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 gap-2 not-italic"
                                                    >
                                                        <a
                                                            href={mapLinkMatch[1]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <MapPin className="w-3 h-3" />
                                                            فتح الموقع على الخريطة
                                                        </a>
                                                    </Button>
                                                )
                                            }
                                            return <span key={i} className="block">{line}</span>
                                        })}
                                    </div>
                                )}

                                {/* Delivery Info */}
                                {order.delivery_method === 'delivery' && (
                                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs font-bold">طلب توصيل للعنوان:</span>
                                        </div>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                                            {order.delivery_address || 'لم يتم تحديد عنوان نصي'}
                                        </p>
                                        {order.delivery_lat && order.delivery_lng && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2 h-9 text-xs border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 gap-2"
                                            >
                                                <a
                                                    href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Navigation className="w-3 h-3" />
                                                    فتح في خرائط Google
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="px-5 pt-0 pb-5 gap-2 flex-col">
                                {/* ===== Pending: Show "استلام وبدء" ===== */}
                                {order.status === 'pending' && (
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                onClick={() => handleProcessing(order)}
                                                disabled={loadingId === order.id}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 font-bold rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                {loadingId === order.id ? 'جاري...' : 'استلام وبدء'}
                                            </Button>
                                            <a
                                                href={`https://wa.me/20${order.customer_phone?.replace(/^0+/, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors border border-emerald-200"
                                                title="إرسال واتساب"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* ===== Processing: Show "تم انهاء الطلب" + "تم التسليم" ===== */}
                                {order.status === 'processing' && (
                                    <div className="flex flex-col gap-2 w-full">
                                        <Button
                                            onClick={() => handleComplete(order)}
                                            disabled={loadingId === order.id}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check className="w-5 h-5" />
                                            {loadingId === order.id ? 'جاري...' : 'تم انهاء الطلب'}
                                        </Button>
                                    </div>
                                )}

                                {/* ===== Completed: Show "تم التسليم" ===== */}
                                {order.status === 'completed' && (
                                    <div className="flex flex-col gap-2 w-full">
                                        <Button
                                            onClick={() => handleDelivered(order)}
                                            disabled={loadingId === order.id}
                                            className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold h-11 rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Truck className="w-5 h-5" />
                                            {loadingId === order.id ? 'جاري...' : 'تم التسليم للعميل'}
                                        </Button>
                                        <a
                                            href={`https://wa.me/20${order.customer_phone?.replace(/^0+/, '')}?text=${encodeURIComponent(formatMessage(settings?.whatsapp_msg_completed || "مرحباً {customer_name}، تم الانتهاء من طلبك. يمكنك استلامه الآن!", order.customer_name))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-9 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border border-emerald-200 font-bold text-sm"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            إبلاغ العميل (واتساب)
                                        </a>
                                    </div>
                                )}

                                {/* ===== Delivered: Done ===== */}
                                {order.status === 'delivered' && (
                                    <div className="w-full text-center py-2">
                                        <span className="text-sm text-gray-500 italic">✅ تم تسليم هذا الطلب</span>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
