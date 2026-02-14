-- Create a separate table for independent Todo-list Orders
CREATE TABLE active_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    items JSONB DEFAULT '[]', -- Array of {name, quantity, details}
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'delivered'))
);

CREATE INDEX idx_active_orders_status ON active_orders(status);
CREATE INDEX idx_active_orders_created_at ON active_orders(created_at);
