"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    UploadCloud,
    X,
    File as FileIcon,
    Loader2,
    Book,
    Printer,
    ChevronLeft,
    RefreshCcw,
    MapPin,
    Truck,
    Store,
    Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { submitOrder } from "@/app/clients/actions";
import { InteractiveMap } from "./interactive-map";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// We will load pdfjs dynamically
let pdfjsLib: any = null;

import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define types for better type safety
type NotebookItem = {
    type: "notebook";
    subject: string;
    stage: string;
    grade: string;
    quantity: number;
    paperCount: number;
    // Constructed detail string for backend
    detail?: string;
};

type PrintItem = {
    type: "print";
    quantity: number;
    pageCount: number;
    binding: boolean;
    colorMode: "bw" | "color";
    printSide: "one" | "two";
    file: File | null;
    fileName?: string;
    additionalNotes?: string;
    rangeType?: "all" | "custom";
    fromPage?: number;
    toPage?: number;
};

type OrderItem = NotebookItem | PrintItem;

const INITIAL_SUBJECTS = [
    "اللغة العربية",
    "اللغة الإنجليزية",
    "رياضيات",
    "علوم",
    "دراسات اجتماعية",
    "دين",
    "حاسب آلي",
    "تربية فنية",
    "اخرى",
];

const STAGES = [
    { id: "primary", label: "المرحلة الابتدائية" },
    { id: "prep", label: "المرحلة الإعدادية" },
    { id: "secondary", label: "المرحلة الثانوية" },
];

const GRADES = {
    primary: [
        "الاول الابتدائي",
        "الثاني الابتدائي",
        "الثالث الابتدائي",
        "الرابع الابتدائي",
        "الخامس الابتدائي",
        "السادس الابتدائي",
    ],
    prep: ["الاول الإعدادي", "الثاني الإعدادي", "الثالث الإعدادي"],
    secondary: ["الاول الثانوي", "الثاني الثانوي", "الثالث الثانوي"],
};

import { SettingsMap } from "@/app/(dashboard)/settings/actions";

export function PortalOrderForm({
    userId,
    settings,
    children,
}: {
    userId: string;
    settings?: SettingsMap;
    children?: React.ReactNode;
}) {
    const [orderType, setOrderType] = useState<"notebook" | "print" | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [estimatedTotal, setEstimatedTotal] = useState<number | null>(null);

    // Items state
    const [items, setItems] = useState<OrderItem[]>([]);

    // Dynamic Subjects List
    const [subjectsList, setSubjectsList] = useState<string[]>(INITIAL_SUBJECTS);
    const [customSubjectInput, setCustomSubjectInput] = useState<{
        index: number;
        value: string;
    } | null>(null);

    // Delivery state
    const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
        "pickup",
    );
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryLocation, setDeliveryLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 30.0444, lng: 31.2357 }); // Default: Cairo
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTrigger, setSearchTrigger] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Dynamically load pdfjs
        import("pdfjs-dist")
            .then((module) => {
                pdfjsLib = module;
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${module.version}/pdf.worker.min.js`;
            })
            .catch((err) => console.error("Failed to load pdfjs", err));
    }, []);

    // Initialize items when type is selected
    const selectType = (type: "notebook" | "print") => {
        setOrderType(type);
        if (type === "notebook") {
            setItems([
                {
                    type: "notebook",
                    subject: "",
                    stage: "",
                    grade: "",
                    quantity: 1,
                    paperCount: 0,
                },
            ]);
        } else {
            setItems([
                {
                    type: "print",
                    quantity: 1,
                    pageCount: 0,
                    binding: false,
                    colorMode: "bw",
                    printSide: "one",
                    file: null,
                    additionalNotes: "",
                },
            ]);
        }
    };

    const resetType = () => {
        if (
            confirm("هل أنت متأكد من تغيير نوع الطلب؟ سيتم حذف البيانات الحالية.")
        ) {
            setOrderType(null);
            setItems([]);
        }
    };

    const goBack = () => {
        setOrderType(null);
        setItems([]);
        setFiles([]);
        setEstimatedTotal(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast.error("المتصفح لا يدعم تحديد الموقع");
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setDeliveryLocation({ lat: latitude, lng: longitude });
                setDeliveryAddress(
                    `الموقع: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                );
                toast.success("تم الحصول على موقعك بنجاح!");
                setGettingLocation(false);
            },
            (error) => {
                toast.error(
                    "فشل الحصول على الموقع. يرجى التأكد من السماح بالوصول للموقع",
                );
                setGettingLocation(false);
            },
        );
    };

    const openMapPicker = () => {
        setShowMapPicker(true);
        // Get current location when opening map
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter({ lat: latitude, lng: longitude });
                },
                (error) => {
                    // If location fails, keep default Cairo location
                    console.log("Could not get current location, using default");
                },
            );
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Trigger search in the interactive map
            setSearchTrigger(searchQuery);
        }
    };

    const handleLocationSelect = (location: {
        lat: number;
        lng: number;
        address: string;
    }) => {
        setDeliveryLocation({ lat: location.lat, lng: location.lng });
        setDeliveryAddress(location.address);
        toast.success("تم تحديد الموقع بنجاح!");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Item management
    const addItem = () => {
        if (orderType === "notebook") {
            setItems((prev) => [
                ...prev,
                {
                    type: "notebook",
                    subject: "",
                    stage: "",
                    grade: "",
                    quantity: 1,
                    paperCount: 0,
                },
            ]);
        } else {
            setItems((prev) => [
                ...prev,
                {
                    type: "print",
                    quantity: 1,
                    pageCount: 0,
                    binding: false,
                    colorMode: "bw",
                    printSide: "one",
                    file: null,
                    additionalNotes: "",
                },
            ]);
        }
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        setItems((prev) => {
            const newItems = [...prev];
            // @ts-ignore
            newItems[index] = { ...newItems[index], [field]: value };

            // If updating stage, reset grade
            if (field === "stage" && newItems[index].type === "notebook") {
                // @ts-ignore
                newItems[index].grade = "";
            }

            return newItems;
        });
        setEstimatedTotal(null); // Reset estimate on change
    };

    const calculateEstimatedCost = () => {
        let total = 0;

        // Default prices incase settings are missing
        const prices = {
            bw_single: settings?.bw_single_price ?? 1.0,
            bw_double: settings?.bw_double_price ?? 1.25,
            color_single: settings?.color_single_price ?? 1.5,
            color_double: settings?.color_double_price ?? 2.0,
            binding_small: settings?.binding_small_cost ?? 15.0,
            binding_large: settings?.binding_large_cost ?? 20.0,
            binding_threshold: settings?.binding_threshold ?? 100,
        };

        // Only calculate for Print items currently
        if (orderType === "print") {
            items.forEach((item: any) => {
                if (item.type === "print") {
                    const pageCount = item.pageCount || 0;
                    const quantity = item.quantity || 1;
                    // 0 is not valid usually, but handle safe math
                    if (pageCount === 0) return;

                    const isDouble = item.printSide === "two";

                    // 1. Calculate Sheets (Physical Paper)
                    // Single: Sheets = Pages
                    // Double: Sheets = Ceil(Pages / 2)
                    const sheets = isDouble ? Math.ceil(pageCount / 2) : pageCount;

                    // 2. Printing Cost (Per Sheet)
                    let printRate = 0;
                    if (item.colorMode === "bw") {
                        printRate = isDouble ? prices.bw_double : prices.bw_single;
                    } else {
                        // Color
                        printRate = isDouble ? prices.color_double : prices.color_single;
                    }

                    const printingCost = sheets * printRate * quantity;

                    // 3. Binding Cost (Per Copy -> Multiply by Quantity)
                    // Binding based on SHEETS per copy
                    let bindingCost = 0;
                    if (item.binding) {
                        const singleCopyBindingCost =
                            sheets < prices.binding_threshold
                                ? prices.binding_small
                                : prices.binding_large;
                        bindingCost = singleCopyBindingCost * quantity;
                    }

                    total += printingCost + bindingCost;
                }
            });
        }

        setEstimatedTotal(total);
    };

    async function handleSubmit(formData: FormData) {
        if (loading || uploading) return;
        setLoading(true);

        try {
            // Validate items
            if (
                activeItems.some((i) => {
                    if (i.type === "notebook") return !i.subject || !i.stage || !i.grade;
                    if (i.type === "print")
                        return !i.pageCount || i.pageCount < 1 || !i.file;
                    return false;
                })
            ) {
                toast.error("يرجى إكمال جميع البيانات واختيار ملف لكل بند طباعة");
                setLoading(false);
                return;
            }

            const fileUrls: string[] = [];

            // 1. Upload Files & Prepare Items
            setUploading(true);
            const supabase = createClient();

            const submissionItems = await Promise.all(
                activeItems.map(async (item) => {
                    let itemFileUrl = "";

                    // Upload file if exists (for Print Items)
                    if (item.type === "print" && item.file) {
                        const file = item.file;
                        const fileExt = file.name.split(".").pop();
                        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                        const { error } = await supabase.storage
                            .from("order-files")
                            .upload(fileName, file);

                        if (error) throw new Error(`Failed to upload ${file.name}`);

                        const {
                            data: { publicUrl },
                        } = supabase.storage.from("order-files").getPublicUrl(fileName);
                        itemFileUrl = publicUrl;
                        fileUrls.push(publicUrl); // Keep track globally too
                    }

                    // Construct backend item
                    if (item.type === "notebook") {
                        return {
                            ...item,
                            detail: `${item.subject} - ${item.grade} (${STAGES.find((s) => s.id === item.stage)?.label})`,
                        };
                    }

                    if (item.type === "print") {
                        const notes = item.additionalNotes
                            ? ` - ملاحظات: ${item.additionalNotes}`
                            : "";
                        return {
                            ...item,
                            detail: `${item.fileName || "ملف"} - ${item.pageCount} صفحة - ${item.quantity} نسخ - ${item.colorMode === "bw" ? "أبيض وأسود" : "ألوان"} ${item.binding ? "+ تكعيب" : ""}${notes}`,
                            fileUrl: itemFileUrl,
                            // Remove raw file object before sending to server action
                            file: undefined,
                        };
                    }
                    return item;
                }),
            );

            // Handle global files (only for Notebook mode if used, currently we focus on per-item for print)
            if (orderType === "notebook" && files.length > 0) {
                const uploadPromises = files.map(async (file) => {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error } = await supabase.storage
                        .from("order-files")
                        .upload(fileName, file);
                    if (error) throw new Error(`Failed to upload ${file.name}`);
                    const {
                        data: { publicUrl },
                    } = supabase.storage.from("order-files").getPublicUrl(fileName);
                    return publicUrl;
                });
                const urls = await Promise.all(uploadPromises);
                fileUrls.push(...urls);
            }

            setUploading(false);

            // 3. Submit Order
            const result = await submitOrder({
                notes: formData.get("notes") as string,
                customerName: "عميل الموقع",
                files: fileUrls,
                items: submissionItems,
                deliveryMethod,
                deliveryAddress,
                deliveryLat: deliveryLocation?.lat,
                deliveryLng: deliveryLocation?.lng,
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("تم إرسال الطلب بنجاح!");

                // Reset all form data
                setOrderType(null);
                setItems([]);
                setFiles([]);
                setEstimatedTotal(null);
                setDeliveryMethod("pickup");
                setDeliveryAddress("");
                setDeliveryLocation(null);

                // Scroll to top to show order type selection
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ أثناء الإرسال");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    }

    // Cast items for easier rendering (we know they match orderType)
    const activeItems = items as OrderItem[];

    if (!orderType) {
        return (
            <div className="space-y-12">
                <Card className="border-none shadow-lg max-w-3xl mx-auto mt-10">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">اختر نوع الطلب</CardTitle>
                        <CardDescription>ما الذي تود القيام به اليوم؟</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6 p-8">
                        <div
                            onClick={() => selectType("notebook")}
                            className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/90 dark:hover:bg-emerald-900/20 transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                                <Book className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                دفاتر تحضير
                            </h3>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                طباعة وتجهيز مذكرات مع ورق تحضير للمدرسين
                            </p>
                        </div>

                        <div
                            onClick={() => selectType("print")}
                            className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/90 dark:hover:bg-blue-900/20 transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                                <Printer className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                طباعة ملفات
                            </h3>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                طباعة مستندات، ملازم، صور من ملفاتك
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Render children (like order history) only when NO specific form is selected */}
                {children}
            </div>
        );
    }

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSubmit(formData);
                }}
            >
                <Card className="border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={goBack}
                                type="button"
                                className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="sr-only">رجوع</span>
                            </Button>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {orderType === "notebook" ? (
                                        <Book className="w-5 h-5 text-orange-500" />
                                    ) : (
                                        <Printer className="w-5 h-5 text-blue-500" />
                                    )}
                                    {orderType === "notebook"
                                        ? "طلب دفاتر تحضير"
                                        : "طلب طباعة ملفات"}
                                </CardTitle>
                                <CardDescription>قم بتعبئة البيانات المطلوبة</CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetType}
                            type="button"
                            className="text-muted-foreground hover:text-red-500"
                        >
                            <RefreshCcw className="w-4 h-4 ml-2" />
                            تغيير النوع
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Items Section */}
                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {activeItems.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{
                                            scale: 1.006,
                                            borderColor: "#10b981",
                                            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="p-6 bg-card text-card-foreground border-2 border-transparent shadow-sm rounded-2xl relative group transition-colors"
                                    >
                                        <div className="absolute top-4 left-4 z-10">
                                            {activeItems.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {item.type === "notebook" ? (
                                            <div className="grid grid-cols-12 gap-4">
                                                {/* Subject */}
                                                <div className="col-span-12 sm:col-span-3 space-y-2">
                                                    <Label className="text-base font-bold">المادة</Label>
                                                    {customSubjectInput?.index === index ? (
                                                        <div className="flex gap-2">
                                                            <Input
                                                                key={`custom-input-${index}`}
                                                                placeholder="اكتب اسم المادة..."
                                                                className="font-bold text-base h-12 border-2 focus-visible:ring-emerald-500 rounded-xl transition-all duration-300 hover:shadow-sm hover:border-emerald-500/50 focus:scale-[1.01]"
                                                                autoFocus
                                                                value={customSubjectInput.value}
                                                                onChange={(e) =>
                                                                    setCustomSubjectInput({
                                                                        index,
                                                                        value: e.target.value,
                                                                    })
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        if (customSubjectInput.value.trim()) {
                                                                            const newVal =
                                                                                customSubjectInput.value.trim();
                                                                            if (!subjectsList.includes(newVal)) {
                                                                                setSubjectsList((prev) => {
                                                                                    const newList = [...prev];
                                                                                    // Insert before 'اخرى'
                                                                                    const otherIndex =
                                                                                        newList.indexOf("اخرى");
                                                                                    if (otherIndex > -1)
                                                                                        newList.splice(
                                                                                            otherIndex,
                                                                                            0,
                                                                                            newVal,
                                                                                        );
                                                                                    else newList.push(newVal);
                                                                                    return newList;
                                                                                });
                                                                            }
                                                                            updateItem(index, "subject", newVal);
                                                                            setCustomSubjectInput(null);
                                                                        }
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    if (customSubjectInput.value.trim()) {
                                                                        const newVal =
                                                                            customSubjectInput.value.trim();
                                                                        if (!subjectsList.includes(newVal)) {
                                                                            setSubjectsList((prev) => {
                                                                                const newList = [...prev];
                                                                                const otherIndex =
                                                                                    newList.indexOf("اخرى");
                                                                                if (otherIndex > -1)
                                                                                    newList.splice(otherIndex, 0, newVal);
                                                                                else newList.push(newVal);
                                                                                return newList;
                                                                            });
                                                                        }
                                                                        updateItem(index, "subject", newVal);
                                                                    } else {
                                                                        // If empty, revert to empty or previous? usage dictates reset
                                                                        updateItem(index, "subject", "");
                                                                    }
                                                                    setCustomSubjectInput(null);
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setCustomSubjectInput(null);
                                                                    updateItem(index, "subject", "");
                                                                }}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Select
                                                            dir="rtl"
                                                            key={`subject-${index}`}
                                                            value={(item as NotebookItem).subject}
                                                            onValueChange={(val) => {
                                                                if (val === "اخرى") {
                                                                    setCustomSubjectInput({ index, value: "" });
                                                                } else {
                                                                    updateItem(index, "subject", val);
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger className="font-bold text-base h-10 border-2 text-right w-full bg-white dark:bg-zinc-900 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 active:scale-[0.99] rounded-xl flex flex-row items-center justify-between">
                                                                <SelectValue placeholder="اختر المادة" />
                                                            </SelectTrigger>
                                                            <SelectContent
                                                                position="popper"
                                                                side="bottom"
                                                                align="start"
                                                                avoidCollisions={false}
                                                                className="max-h-[500px]"
                                                            >
                                                                {subjectsList.map((s) => (
                                                                    <SelectItem
                                                                        key={s}
                                                                        value={s}
                                                                        className="text-base font-bold text-right"
                                                                        style={{ direction: "rtl" }}
                                                                    >
                                                                        {s}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>

                                                {/* Stage */}
                                                <div className="col-span-6 sm:col-span-3 space-y-2">
                                                    <Label className="text-base font-bold">المرحلة</Label>
                                                    <Select
                                                        dir="rtl"
                                                        key={`stage-${index}`}
                                                        value={item.stage}
                                                        onValueChange={(val) =>
                                                            updateItem(index, "stage", val)
                                                        }
                                                    >
                                                        <SelectTrigger className="font-bold text-base h-10 border-2 text-right w-full bg-white dark:bg-zinc-900 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 active:scale-[0.99] rounded-xl flex flex-row items-center justify-between">
                                                            <SelectValue placeholder="اختر المرحلة" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            position="popper"
                                                            side="bottom"
                                                            align="start"
                                                            dir="rtl"
                                                            avoidCollisions={false}
                                                            className="max-h-[500px]"
                                                        >
                                                            {STAGES.map((s) => (
                                                                <SelectItem
                                                                    key={s.id}
                                                                    value={s.id}
                                                                    className="text-base font-bold text-right"
                                                                    style={{ direction: "rtl" }}
                                                                >
                                                                    {s.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Grade */}
                                                <div className="col-span-6 sm:col-span-3 space-y-2">
                                                    <Label className="text-base font-bold">الصف</Label>
                                                    <Select
                                                        dir="rtl"
                                                        key={`grade-${index}`}
                                                        value={item.grade}
                                                        onValueChange={(val) =>
                                                            updateItem(index, "grade", val)
                                                        }
                                                        disabled={!item.stage}
                                                    >
                                                        <SelectTrigger className="font-bold text-base h-10 border-2 text-right w-full bg-white dark:bg-zinc-900 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 active:scale-[0.99] rounded-xl flex flex-row items-center justify-between">
                                                            <SelectValue placeholder="اختر الصف" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            position="popper"
                                                            side="bottom"
                                                            align="start"
                                                            dir="rtl"
                                                            avoidCollisions={false}
                                                            className="max-h-[500px]"
                                                        >
                                                            {item.stage &&
                                                                GRADES[item.stage as keyof typeof GRADES]?.map(
                                                                    (g) => (
                                                                        <SelectItem
                                                                            key={g}
                                                                            value={g}
                                                                            className="text-base font-bold text-right"
                                                                            style={{ direction: "rtl" }}
                                                                        >
                                                                            {g}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Quantity & Paper Count */}
                                                <div className="col-span-6 sm:col-span-3 space-y-2">
                                                    <Label className="text-base font-bold">الكمية</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                "quantity",
                                                                parseInt(e.target.value) || 1,
                                                            )
                                                        }
                                                        className="text-center text-lg font-bold border-2 focus-visible:ring-emerald-500 h-10"
                                                    />
                                                </div>
                                                <div className="col-span-6 sm:col-span-3 space-y-2">
                                                    <Label className="text-base font-bold">
                                                        الورق الصافي للتحضير
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        value={item.paperCount || ""}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                "paperCount",
                                                                parseInt(e.target.value) || 0,
                                                            )
                                                        }
                                                        className="text-center text-lg font-bold border-2 focus-visible:ring-emerald-500 h-10"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-12 gap-2 items-end">
                                                {/* File Upload for Item - Full Width */}
                                                <div className="col-span-2 md:col-span-12 mb-2">
                                                    <div
                                                        onClick={() =>
                                                            document
                                                                .getElementById(`file-input-${index}`)
                                                                ?.click()
                                                        }
                                                        className={`border-2 border-dashed rounded-lg p-3 flex items-center justify-between cursor-pointer transition-all duration-200 ${item.file ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20" : "border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <UploadCloud
                                                                className={`w-5 h-5 ${item.file ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                                                            />
                                                            <div className="text-right">
                                                                <p
                                                                    className={`text-base font-bold ${item.file ? "text-emerald-800 dark:text-emerald-300" : "text-slate-700 dark:text-slate-200"}`}
                                                                >
                                                                    {item.fileName || "اختر ملف للطباعة"}
                                                                </p>
                                                                {!item.file && (
                                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                                                        PDF, Word, Images
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {item.file && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-400 hover:text-red-600 h-8 w-8 p-0 hover:bg-red-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateItem(index, "file", null);
                                                                    updateItem(index, "fileName", "");
                                                                }}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <input
                                                            id={`file-input-${index}`}
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    const f = e.target.files[0];
                                                                    updateItem(index, "file", f);
                                                                    updateItem(index, "fileName", f.name);

                                                                    if (f.type === "application/pdf") {
                                                                        const reader = new FileReader();
                                                                        reader.onload = async function () {
                                                                            try {
                                                                                if (!pdfjsLib) {
                                                                                    const module =
                                                                                        await import("pdfjs-dist");
                                                                                    pdfjsLib = module;
                                                                                    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${module.version}/pdf.worker.min.js`;
                                                                                }

                                                                                const typedarray = new Uint8Array(
                                                                                    this.result as ArrayBuffer,
                                                                                );
                                                                                const pdf =
                                                                                    await pdfjsLib.getDocument(typedarray)
                                                                                        .promise;
                                                                                const numPages = pdf.numPages;
                                                                                updateItem(
                                                                                    index,
                                                                                    "pageCount",
                                                                                    numPages,
                                                                                );
                                                                                toast.success(
                                                                                    `تم التعرف على ${numPages} صفحة تلقائياً`,
                                                                                );
                                                                            } catch (error) {
                                                                                console.error(
                                                                                    "Error counting PDF pages:",
                                                                                    error,
                                                                                );
                                                                            }
                                                                        };
                                                                        reader.readAsArrayBuffer(f);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Print Details */}
                                                <div className="col-span-2 md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <div className="col-span-1 md:col-span-4 space-y-1.5">
                                                        <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                            نطاق الطباعة
                                                        </Label>
                                                        <Select
                                                            value={item.rangeType || "all"}
                                                            onValueChange={(val) => {
                                                                updateItem(index, "rangeType", val);
                                                                if (val === "all") {
                                                                    updateItem(index, "fromPage", undefined);
                                                                    updateItem(index, "toPage", undefined);
                                                                } else {
                                                                    updateItem(index, "fromPage", 1);
                                                                    updateItem(index, "toPage", 1);
                                                                    updateItem(index, "pageCount", 1);
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger className="font-bold text-base h-10 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 border text-right w-full focus:ring-blue-600">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem
                                                                    value="all"
                                                                    className="font-bold text-base"
                                                                >
                                                                    كامل الملف
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value="custom"
                                                                    className="font-bold text-base"
                                                                >
                                                                    صفحات محددة (من - إلى)
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {item.rangeType === "custom" ? (
                                                        <>
                                                            <div className="col-span-1 md:col-span-2 space-y-1.5 animate-in fade-in zoom-in duration-200">
                                                                <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                                    من صـ
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.fromPage || ""}
                                                                    onChange={(e) => {
                                                                        const from = parseInt(e.target.value) || 0;
                                                                        updateItem(index, "fromPage", from);
                                                                        const to = item.toPage || 0;
                                                                        if (to >= from) {
                                                                            updateItem(
                                                                                index,
                                                                                "pageCount",
                                                                                to - from + 1,
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="font-bold text-lg text-center h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-blue-600"
                                                                />
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2 space-y-1.5 animate-in fade-in zoom-in duration-200">
                                                                <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                                    إلى صـ
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.toPage || ""}
                                                                    onChange={(e) => {
                                                                        const to = parseInt(e.target.value) || 0;
                                                                        updateItem(index, "toPage", to);
                                                                        const from = item.fromPage || 0;
                                                                        if (to >= from) {
                                                                            updateItem(
                                                                                index,
                                                                                "pageCount",
                                                                                to - from + 1,
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="font-bold text-lg text-center h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-blue-600"
                                                                />
                                                            </div>
                                                            <div className="col-span-1 md:col-span-4 space-y-1.5">
                                                                <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                                    عدد الصفحات
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.pageCount || ""}
                                                                    readOnly
                                                                    className="font-bold text-lg text-center h-10 border-blue-300 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 cursor-not-allowed"
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="col-span-1 md:col-span-8 space-y-1.5">
                                                            <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                                عدد صفحات الملف
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                placeholder="أدخل إجمالي عدد الصفحات"
                                                                value={item.pageCount || ""}
                                                                onChange={(e) =>
                                                                    updateItem(
                                                                        index,
                                                                        "pageCount",
                                                                        parseInt(e.target.value) || 0,
                                                                    )
                                                                }
                                                                required
                                                                className="font-bold text-lg text-center h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-blue-600 focus-visible:border-blue-600"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                                    <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                        نسخ
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                "quantity",
                                                                parseInt(e.target.value) || 1,
                                                            )
                                                        }
                                                        className="font-bold text-lg text-center h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-blue-600 focus-visible:border-blue-600"
                                                    />
                                                </div>

                                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                                    <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                        النظام
                                                    </Label>
                                                    <select
                                                        value={item.colorMode}
                                                        onChange={(e) =>
                                                            updateItem(index, "colorMode", e.target.value)
                                                        }
                                                        className="font-bold text-base h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-blue-600 text-right px-2 w-full rounded-md border bg-white"
                                                    >
                                                        <option value="bw">أبيض وأسود</option>
                                                        <option value="color">ألوان</option>
                                                    </select>
                                                </div>

                                                <div className="col-span-1 md:col-span-3 space-y-1.5">
                                                    <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                        خيارات الطباعة
                                                    </Label>
                                                    <select
                                                        value={item.printSide}
                                                        onChange={(e) =>
                                                            updateItem(index, "printSide", e.target.value)
                                                        }
                                                        className="font-bold text-base h-10 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-blue-600 text-right px-2 w-full rounded-md border bg-white"
                                                    >
                                                        <option value="one">وجه واحد</option>
                                                        <option value="two">وجهين (Double Side)</option>
                                                    </select>
                                                </div>

                                                <div className="col-span-1 md:col-span-3 space-y-1.5">
                                                    <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                                        التكعيب
                                                    </Label>
                                                    <div className="flex items-center justify-center gap-3 h-10 border-2 border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            id={`binding-${index}`}
                                                            checked={item.binding}
                                                            onChange={(e) =>
                                                                updateItem(index, "binding", e.target.checked)
                                                            }
                                                            className="h-5 w-5 rounded-md border-2 border-slate-400 cursor-pointer accent-blue-600"
                                                        />
                                                        <Label
                                                            htmlFor={`binding-${index}`}
                                                            className="cursor-pointer text-base font-bold text-slate-800 dark:text-slate-200 select-none"
                                                        >
                                                            مطلوب
                                                        </Label>
                                                    </div>
                                                </div>

                                                <div className="col-span-2 md:col-span-12 pt-1">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`notes-check-${index}`}
                                                            checked={!!item.additionalNotes}
                                                            onCheckedChange={(checked) => {
                                                                if (!checked)
                                                                    updateItem(index, "additionalNotes", "");
                                                                else updateItem(index, "additionalNotes", " ");
                                                            }}
                                                            className="h-3.5 w-3.5 border-slate-400 dark:border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                                        />
                                                        <Label
                                                            htmlFor={`notes-check-${index}`}
                                                            className="text-base cursor-pointer text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors select-none font-bold"
                                                        >
                                                            إضافة ملاحظات خاصة؟
                                                        </Label>
                                                    </div>

                                                    {item.additionalNotes !== undefined &&
                                                        item.additionalNotes !== "" && (
                                                            <Input
                                                                placeholder="تفاصيل التكعيب أو ملاحظات أخرى..."
                                                                value={
                                                                    item.additionalNotes.trim() === "" &&
                                                                        item.additionalNotes.length === 1
                                                                        ? ""
                                                                        : item.additionalNotes
                                                                }
                                                                onChange={(e) =>
                                                                    updateItem(
                                                                        index,
                                                                        "additionalNotes",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-10 text-base font-bold border-amber-300 dark:border-slate-600 focus-visible:ring-amber-500 bg-amber-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                                                            />
                                                        )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                            className={`w-full border-dashed border-2 py-8 text-gray-500 dark:text-gray-400 dark:border-slate-700 gap-2 ${orderType === "notebook" ? "hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"}`}
                        >
                            {orderType === "notebook" ? (
                                <Book className="w-4 h-4" />
                            ) : (
                                <Printer className="w-4 h-4" />
                            )}
                            {orderType === "notebook"
                                ? "إضافة دفتر آخر"
                                : "إضافة ملف طباعة آخر"}
                        </Button>

                        <div className="h-px bg-gray-200 my-6" />

                        {orderType === "notebook" && (
                            <div className="space-y-2">
                                <Label>الملفات المرفقة (اختياري)</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg py-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800`}
                                >
                                    <div className="flex items-center gap-3">
                                        <UploadCloud className="w-6 h-6 text-gray-400 dark:text-slate-400" />
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                اضغط لرفع الملفات
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                PDF, Images, Word
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="grid gap-2 mt-2">
                                        {files.map((file, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700 text-sm"
                                            >
                                                <span className="truncate max-w-[200px] dark:text-slate-200">
                                                    {file.name}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 dark:text-red-400 h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => removeFile(i)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-base font-bold">
                                ملاحظات إضافية
                            </Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="أي تفاصيل أخرى..."
                                className="min-h-[80px] resize-none text-base"
                            />
                        </div>

                        {/* Delivery Method Section */}
                        <div className="space-y-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-900">
                            <Label className="text-base font-bold text-slate-700 dark:text-slate-200">
                                طريقة الاستلام
                            </Label>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Pickup Option */}
                                <div
                                    onClick={() => setDeliveryMethod("pickup")}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${deliveryMethod === "pickup"
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                        : "border-slate-300 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <Store
                                            className={`w-8 h-8 ${deliveryMethod === "pickup" ? "text-emerald-600" : "text-slate-500"}`}
                                        />
                                        <span
                                            className={`font-bold ${deliveryMethod === "pickup" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}
                                        >
                                            استلام من المحل
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            مجاني
                                        </span>
                                    </div>
                                </div>

                                {/* Delivery Option */}
                                <div
                                    onClick={() => setDeliveryMethod("delivery")}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${deliveryMethod === "delivery"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                        : "border-slate-300 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <Truck
                                            className={`w-8 h-8 ${deliveryMethod === "delivery" ? "text-blue-600" : "text-slate-500"}`}
                                        />
                                        <span
                                            className={`font-bold ${deliveryMethod === "delivery" ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}
                                        >
                                            توصيل للعنوان
                                        </span>
                                        <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                                            +30-50 جنيه
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address Section */}
                            {deliveryMethod === "delivery" && (
                                <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700">
                                    <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg">
                                        <span className="text-orange-600 dark:text-orange-400 text-sm">
                                            ℹ️ <strong>ملحوظة:</strong> سيتم إضافة تكلفة الشحن (30-50
                                            جنيه) على حسب المسافة
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-bold">
                                            العنوان التفصيلي
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="اكتب عنوانك التفصيلي هنا..."
                                            className="min-h-[60px] resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={getLocation}
                                            disabled={gettingLocation}
                                            className="border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                                        >
                                            {gettingLocation ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                    جاري تحديد الموقع...
                                                </>
                                            ) : (
                                                <>
                                                    <MapPin className="w-4 h-4 ml-2" />
                                                    موقعي الحالي
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={openMapPicker}
                                            className="border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-400"
                                        >
                                            <MapPin className="w-4 h-4 ml-2" />
                                            اختر من الخريطة
                                        </Button>
                                    </div>

                                    {deliveryLocation && (
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                                onClick={() =>
                                                    window.open(
                                                        `https://www.google.com/maps?q=${deliveryLocation.lat},${deliveryLocation.lng}`,
                                                        "_blank",
                                                    )
                                                }
                                            >
                                                عرض على الخريطة
                                            </Button>
                                        </div>
                                    )}

                                    {deliveryLocation && (
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded text-xs text-emerald-700 dark:text-emerald-400">
                                            ✓ تم تحديد موقعك بنجاح
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cost Calculation Section (Print Only) */}
                        {orderType === "print" && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg dark:text-slate-200">
                                        حساب التكلفة التقديرية
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={calculateEstimatedCost}
                                        className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    >
                                        احسب التكلفة
                                    </Button>
                                </div>

                                {estimatedTotal !== null && (
                                    <div className="text-center p-3 bg-white dark:bg-slate-950 rounded border-2 border-emerald-500/50 dark:border-emerald-500/30">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                            الإجمالي المتوقع
                                        </p>
                                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {estimatedTotal}{" "}
                                            <span className="text-base font-normal">جنيه</span>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2 dark:text-slate-500">
                                            * التكلفة نهائية قد تختلف قليلاً عند المراجعة
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className={`w-full font-bold h-11 ${orderType === "notebook" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
                            disabled={loading || uploading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {uploading ? "جاري رفع الملفات..." : "جاري الإرسال..."}
                                </>
                            ) : (
                                "إرسال الطلب"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            {/* Map Picker Modal */}
            {showMapPicker && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
                    onClick={() => setShowMapPicker(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    اختر موقع التوصيل
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    انقر على الخريطة لتحديد المكان
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMapPicker(false)}
                                className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Map Container */}
                        <div className="p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {/* Search Section */}
                            <div className="space-y-2">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    ابحث عن مكان
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="مثال: ميدان التحرير، القاهرة"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleSearch();
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={!searchQuery.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    البحث سيتم في الخريطة أدناه مباشرة
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
                                💡 <strong>كيفية الاستخدام:</strong>
                                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs md:text-sm">
                                    <li>ابحث عن المكان باستخدام حقل البحث أعلاه</li>
                                    <li>أو انقر مباشرة على الخريطة لتحديد الموقع</li>
                                    <li>يمكنك سحب العلامة لتعديل الموقع</li>
                                    <li>سيتم حفظ الموقع تلقائياً عند النقر</li>
                                </ol>
                            </div>

                            {/* Interactive Google Maps */}
                            <InteractiveMap
                                center={mapCenter}
                                onLocationSelect={handleLocationSelect}
                                searchQuery={searchTrigger}
                            />

                            {deliveryLocation && (
                                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3 text-sm">
                                    <p className="font-bold text-green-700 dark:text-green-400 mb-1">
                                        ✓ تم تحديد الموقع
                                    </p>
                                    <p className="text-green-600 dark:text-green-500 text-xs">
                                        {deliveryAddress}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    type="button"
                                    className="flex-1 text-sm bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => {
                                        if (deliveryLocation) {
                                            setShowMapPicker(false);
                                        } else {
                                            toast.error("يرجى اختيار موقع على الخريطة أولاً");
                                        }
                                    }}
                                    disabled={!deliveryLocation}
                                >
                                    حفظ الموقع
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowMapPicker(false)}
                                    className="flex-1 text-sm"
                                >
                                    إغلاق
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
