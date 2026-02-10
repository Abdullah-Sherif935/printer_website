'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Expense {
    id: string
    description: string
    amount: number
    category: string
    category_id?: string
    expense_date: string
    created_at: string
}

export async function getExpenseCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }
    return data
}

export async function getExpenses() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('expenses')
        .select('*, expense_categories(name)')
        .order('expense_date', { ascending: false })

    if (error) {
        console.error('Error fetching expenses:', error)
        return []
    }

    // Map category name from relation if text column is empty
    return data.map(exp => ({
        ...exp,
        category: exp.expense_categories?.name || exp.category
    })) as Expense[]
}

export async function addExpense(formData: FormData) {
    const supabase = await createClient()

    const description = formData.get('description') as string
    const amount = parseFloat(formData.get('amount') as string)
    const categoryId = formData.get('category_id') as string
    const category = formData.get('category') as string
    const dateValue = formData.get('date') as string || formData.get('expense_date') as string

    const { error } = await supabase
        .from('expenses')
        .insert({
            description,
            amount,
            category_id: categoryId || null,
            category: category || null,
            expense_date: dateValue || new Date().toISOString().split('T')[0]
        })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/expenses')
    return { success: true }
}

export async function deleteExpense(expenseId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/expenses')
    return { success: true }
}
