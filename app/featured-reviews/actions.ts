'use server'

import { createClient } from '@/lib/supabase/server'

export async function getFeaturedReviews() {
    const supabase = await createClient()

    // Get top 3 latest 5-star reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            profiles (
                full_name
            )
        `)
        .eq('rating', 5)
        .order('created_at', { ascending: false })
        .limit(3)

    return reviews
}
