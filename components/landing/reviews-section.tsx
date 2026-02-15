'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Quote, Star } from "lucide-react"

interface Review {
    comment: string
    profiles: {
        full_name: string
    }
}

export function ReviewsSection({ reviews = [] }: { reviews: any[] }) {
    if (!reviews || reviews.length === 0) {
        // Fallback demo data if DB is empty
        reviews = [
            {
                comment: "خدمة فوق الممتازة وسرعة في التسليم، شكراً لكم!",
                profiles: { full_name: "محمد أحمد" }
            },
            {
                comment: "جودة الطباعة عالية جداً والأسعار مناسبة.",
                profiles: { full_name: "سارة علي" }
            },
            {
                comment: "تجربة مميزة وسهولة في التعامل مع الموقع.",
                profiles: { full_name: "عبدالله الشريف" }
            }
        ]
    }

    return (
        <section className="bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black md:text-5xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        ماذا يقول عملاؤنا؟
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        نفخر بثقة عملائنا ونسعى دائماً لتقديم أفضل جودة طباعة بأسرع وقت.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review, i) => (
                        <Card key={i} className="group hover:-translate-y-2 transition-all duration-300 border-none shadow-lg hover:shadow-xl bg-white dark:bg-zinc-800 relative overflow-hidden">
                            {/* Decorative Quote Icon */}
                            <Quote className="absolute top-4 left-4 w-12 h-12 text-emerald-100 dark:text-emerald-900/20 -z-0 rotate-180" />

                            <CardContent className="p-8 space-y-6 relative z-10">
                                {/* Stars */}
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                {/* Comment */}
                                <p className="text-lg font-medium leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[80px]">
                                    "{review.comment}"
                                </p>

                                {/* Author Info */}
                                <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {review.profiles?.full_name?.charAt(0) || 'ع'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">
                                            {review.profiles?.full_name || 'عميل مميز'}
                                        </h4>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">عميل موثوق ✅</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
