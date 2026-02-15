import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Public paths that don't require authentication
    const isPublicPath =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/clients/login') ||
        request.nextUrl.pathname.startsWith('/clients/register')

    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone()

        // If trying to access portal but not logged in, redirect to portal register (default landing)
        if (request.nextUrl.pathname.startsWith('/clients')) {
            url.pathname = '/clients/register'
        } else {
            // Otherwise redirect to main (admin) login
            url.pathname = '/login'
        }

        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
