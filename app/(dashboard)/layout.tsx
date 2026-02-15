
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. Initialize Supabase Client within a try/catch to catch critical init errors
    try {
        const supabase = await createClient()

        // 2. Get User securely
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser()

        // 3. Handle No User - Redirect to Login
        if (userError || !user) {
            console.log("No user found, redirecting to login");
            redirect("/login")
        }

        // 4. Check Role
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        // Handle profile fetch error (e.g., user exists but no profile)
        if (profileError) {
            console.error("Layout Profile Error:", profileError);
            // Optional: Redirect to a setup page or show error, but here redirect to login is safest fallback
            redirect("/login")
        }

        // 5. Redirect Customers to Portal
        // This is crucial for security
        if (profile?.role === "customer") {
            redirect("/clients")
        }

    } catch (error) {
        // Special Handling for Next.js Redirects
        if (error instanceof Error && (error.message === "NEXT_REDIRECT" || error.message.includes("NEXT_REDIRECT"))) {
            throw error;
        }

        console.error("CRITICAL LAYOUT ERROR:", error);
        // Fallback to login on critical failure
        redirect("/login")
    }

    // 6. Render Dashboard for Admin/Staff only
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            storageKey="admin-theme"
        >
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <DashboardHeader />
                    <main className="flex-1 p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider>
    )
}
