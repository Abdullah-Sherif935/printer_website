-- Migration: Update active_orders status constraint to include all statuses
-- Add 'processing' and 'delivered' to the allowed status values

-- Drop existing check constraint
ALTER TABLE active_orders DROP CONSTRAINT IF EXISTS active_orders_status_check;

-- Add updated check constraint with all 4 statuses
ALTER TABLE active_orders ADD CONSTRAINT active_orders_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'delivered'));
