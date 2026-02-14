-- Migration: Add delivery and location fields to active_orders table

ALTER TABLE public.active_orders
ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS delivery_lat numeric,
ADD COLUMN IF NOT EXISTS delivery_lng numeric;

-- Ensure delivery_method is either 'pickup' or 'delivery'
ALTER TABLE public.active_orders 
ADD CONSTRAINT check_delivery_method 
CHECK (delivery_method IN ('pickup', 'delivery'));
