-- Migration: Fix orders table constraints
-- 1. Update status check constraint to include 'partial_payment'
-- 2. Ensure created_by has no NOT NULL constraint (redundant but safe)

-- Drop existing check constraint if it exists (names vary)
DO $$
BEGIN
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
END $$;

-- Add updated check constraint
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'partial_payment'));

-- Ensure created_by is nullable
ALTER TABLE public.orders ALTER COLUMN created_by DROP NOT NULL;
