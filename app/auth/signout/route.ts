import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Sign out the current user
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Sign out error:', error)
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}

// Handle GET requests as well, just in case a regular link is used
export async function GET(request: Request) {
    const supabase = await createClient()

    // Sign out the current user
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Sign out error:', error)
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}
