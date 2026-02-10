ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_customer_id_fkey, 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) 
REFERENCES public.customers(id) 
ON DELETE SET NULL;
