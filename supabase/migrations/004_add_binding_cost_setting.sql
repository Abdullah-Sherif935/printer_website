-- Migration: Add default_binding_cost to settings table

INSERT INTO public.settings (key, value) 
VALUES ('default_binding_cost', '5.00')
ON CONFLICT (key) DO NOTHING;