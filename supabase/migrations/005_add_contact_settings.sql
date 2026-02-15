-- Migration: Add whatsapp_number and contact_phone to settings table

INSERT INTO public.settings (key, value) 
VALUES 
    ('whatsapp_number', '01030360804'),
    ('contact_phone', '01030360804')
ON CONFLICT (key) DO NOTHING;
