'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { PlusSquare, Share, Smartphone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function InstallPrompt() {
    const pathname = usePathname()
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)

    const isDashboard = pathname?.startsWith('/dashboard') || pathname === '/admin';
    const title = isDashboard ? 'تثبيت لوحة التحكم' : 'تثبيت تطبيق المهندس';
    const description = isDashboard
        ? 'لإدارة الطلبات بشكل أسرع، قم بتثبيت لوحة التحكم على جهازك.'
        : 'للحصول على أفضل تجربة واستلام إشعارات بحالة طلبك، قم بتثبيت التطبيق الآن على جهازك.';

    useEffect(() => {
        // Check if installed (standalone mode)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone || document.referrer.includes('android-app://');

        setIsStandalone(isStandaloneMode);

        if (isStandaloneMode) {
            return; // Already installed, do nothing.
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // For Android/Desktop Chrome: handle beforeinstallprompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault(); // Prevent automatic mini-infobar
            setDeferredPrompt(e);
            setShowPrompt(true); // Show our custom prompt immediately
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS: Show prompt immediately (since there is no event) if not installed
        if (ios && !isStandaloneMode) {
            setShowPrompt(true);
        }

        // Cleanup
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return; // Should not happen for Android, but safe guard
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };

    if (!showPrompt || isStandalone) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
            >
                <div className="max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-5 relative overflow-hidden">
                    {/* Close Button (Optional, but user said 'show until installed', maybe hide close for aggressive prompt?) */}
                    {/* User requested: 'show with every visit until installed so dont send again', implying persistent pestering.
                        But good UX usually allows closing for the session. I'll add a small close button just in case it covers important content. */}
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="absolute top-3 left-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                            <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        {isIOS ? (
                            <div className="space-y-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-sm">1</span>
                                    <span>اضغط على زر المشاركة <Share className="w-4 h-4 inline mx-1" /> في المتصفح</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-sm">2</span>
                                    <span>اختر "إضافة إلى الشاشة الرئيسية" <PlusSquare className="w-4 h-4 inline mx-1" /></span>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={handleInstallClick}
                                className="w-full font-bold text-base h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                <Smartphone className="w-5 h-5 ml-2" />
                                تثبيت التطبيق الآن
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
