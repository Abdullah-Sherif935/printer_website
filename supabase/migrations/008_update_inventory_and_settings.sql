-- Migration: Update inventory types and remove old binding settings
BEGIN;

-- 1. Add unique constraint to 'name' to allow ON CONFLICT (if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_name_key'
    ) THEN
        ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_name_key UNIQUE (name);
    END IF;
END $$;

-- 2. Update check constraint for inventory_items.type to include 'cover'
ALTER TABLE public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_type_check;
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_type_check 
  CHECK (type IN ('paper', 'binding', 'cover', 'ink', 'other'));

-- 2. Insert the two cover items
-- Using names 'غلاف شفاف' and 'غلاف معتم'
-- Setting initial price to 1.00 as a placeholder, user can change later.
INSERT INTO public.inventory_items (name, type, quantity, cost_per_unit, low_stock_threshold)
VALUES 
  ('غلاف شفاف', 'cover', 500, 1.00, 50),
  ('غلاف معتم', 'cover', 500, 1.00, 50)
ON CONFLICT (name) DO NOTHING;

-- 3. Remove binding related settings
DELETE FROM public.settings WHERE key IN ('coil_box_price', 'coil_box_quantity', 'cover_pack_price', 'cover_pack_quantity', 'default_binding_cost');

COMMIT;
