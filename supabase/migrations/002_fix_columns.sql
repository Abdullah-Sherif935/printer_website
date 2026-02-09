-- Migration: Add expense management support
-- This adds simple category support and renames date column for clarity

-- Add category column as text instead of FK for simplicity
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category text;

-- Rename date to expense_date for clarity (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'expense_date'
    ) THEN
        ALTER TABLE public.expenses RENAME COLUMN date TO expense_date;
    END IF;
END $$;

-- Add current_debt column to customers if missing
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_debt numeric(10, 2) DEFAULT 0.00;

-- Rename balance to current_debt if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'balance'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'current_debt'
    ) THEN
        ALTER TABLE public.customers RENAME COLUMN balance TO current_debt;
    END IF;
END $$;

-- Add email column to customers if missing
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email text;
