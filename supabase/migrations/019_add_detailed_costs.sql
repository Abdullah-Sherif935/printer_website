-- Migration: Add detailed printing costs to settings table

INSERT INTO public.settings (key, value) 
VALUES 
    ('bw_single_price', '1.00'),
    ('bw_double_price', '1.25'),
    ('color_single_price', '1.50'),
    ('color_double_price', '2.00'),
    ('binding_small_cost', '15.00'),
    ('binding_large_cost', '20.00'),
    ('binding_threshold', '100')
ON CONFLICT (key) DO NOTHING;
