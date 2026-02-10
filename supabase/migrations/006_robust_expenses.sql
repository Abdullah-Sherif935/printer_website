-- Migration: Add operational expenses structure
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pre-populate categories
INSERT INTO public.expense_categories (name) VALUES 
('إيجار'),
('كهرباء'),
('صيانة'),
('عمالة'),
('خامات مصرفية'),
('أخرى')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.operational_expenses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount numeric(10, 2) NOT NULL,
    category_id uuid REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    description text,
    expense_date date DEFAULT current_date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
DO $$ 
BEGIN
    ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.operational_expenses ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Policies (Check if they exist first to avoid errors)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for authenticated users' AND tablename = 'expense_categories') THEN
        CREATE POLICY "Enable all for authenticated users" ON public.expense_categories FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for authenticated users' AND tablename = 'operational_expenses') THEN
        CREATE POLICY "Enable all for authenticated users" ON public.operational_expenses FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
