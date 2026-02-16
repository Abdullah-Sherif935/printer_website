import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashScreen } from '@/components/splash-screen'
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "المهندس للطباعة - نظام الإدارة",
  description: "نظام شامل لإدارة المطابع والمكتبات",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <SplashScreen />
        {children}
        <InstallPrompt />
        <Toaster />
      </body>
    </html>
  );
}
