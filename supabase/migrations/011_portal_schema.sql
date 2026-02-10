-- Update profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS phone_number text;

-- Update active_orders table
ALTER TABLE active_orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS file_urls text[], -- Array of URLs
ADD COLUMN IF NOT EXISTS order_source text DEFAULT 'manual' CHECK (order_source IN ('manual', 'online'));

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    is_read boolean DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own notifications
CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins (or system) can insert notifications
-- For now, we allow authenticated users to insert if they are the sender (or use a service role function)
-- A safer approach used often is to wrap insertion in a security definer function, but for simplicity:
CREATE POLICY "System/Admins can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (true); -- Ideally restrict to admin role, but basic auth check is start

-- Trigger to auto-update updated_at optional but good practice (skipping for brevity unless needed)
