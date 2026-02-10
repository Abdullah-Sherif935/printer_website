import { createClient } from './lib/supabase/server'

async function debugSchema() {
    const supabase = await createClient()
    const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

    if (tablesError) {
        console.error('Error fetching tables:', tablesError)
        return
    }

    console.log('Tables in public schema:', tables.map(t => t.table_name))

    for (const table of tables) {
        const { data: constraints, error: constError } = await supabase
            .from('information_schema.key_column_usage')
            .select('*')
            .eq('table_name', table.table_name)

        if (!constError) {
            console.log(`Constraints for ${table.table_name}:`, constraints)
        }
    }
}

debugSchema()
