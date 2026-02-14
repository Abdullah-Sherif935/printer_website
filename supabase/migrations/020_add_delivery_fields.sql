-- Add delivery fields to active_orders
ALTER TABLE active_orders
ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery')),
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS delivery_lat double precision,
ADD COLUMN IF NOT EXISTS delivery_lng double precision;
