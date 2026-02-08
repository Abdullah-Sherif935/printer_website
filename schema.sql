-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
-- Links to Supabase Auth user via id
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text check (role in ('admin', 'staff')) default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- CUSTOMERS
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  balance numeric(10, 2) default 0.00, -- Positive means they owe us, negative means we owe them (credit)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.customers enable row level security;

-- INVENTORY ITEMS
create table public.inventory_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text check (type in ('paper', 'binding', 'ink', 'other')) not null,
  quantity integer default 0,
  cost_per_unit numeric(10, 4) default 0.0000, -- High precision for unit cost
  low_stock_threshold integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inventory_items enable row level security;

-- EXPENSE CATEGORIES
create table public.expense_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.expense_categories enable row level security;

-- EXPENSES
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  amount numeric(10, 2) not null,
  category_id uuid references public.expense_categories(id) on delete set null,
  description text,
  date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.expenses enable row level security;

-- PAYMENT METHODS (Configurable)
create table public.payment_methods (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique, -- Cash, Vodafone Cash, InstaPay
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payment_methods enable row level security;


-- ORDERS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id) on delete set null,
  status text check (status in ('pending', 'processing', 'completed', 'paid', 'partial_payment', 'cancelled')) default 'pending',
  total_amount numeric(10, 2) default 0.00,
  paid_amount numeric(10, 2) default 0.00,
  payment_method_id uuid references public.payment_methods(id), 
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- ORDER ITEMS
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  type text check (type in ('print', 'binding', 'service', 'other')) not null,
  
  -- Details stored as JSONB for flexibility (e.g., {"color_pages": 10, "bw_pages": 50, "copies": 2, "paper_id": "..."})
  details jsonb default '{}'::jsonb, 
  
  quantity integer default 1, -- Multiplier for the item (usually 1 if details handle copies, but good to have)
  cost_calculated numeric(10, 2) default 0.00, -- The cost to us
  price_sold numeric(10, 2) default 0.00, -- The price we sold it for
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;

-- SETTINGS (Global Config)
create table public.settings (
    id uuid default uuid_generate_v4() primary key,
    key text unique not null,
    value text, -- Store as text, cast as needed
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;

-- RLS POLICIES (Basic Setup)

-- PROFILES: Reading allowed for authenticated users. Updates only by self or admin.
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- For simplicity in this script, we'll allow authenticated 'staff' full access to operational tables.
-- A more complex production app would fine-tune this.

-- CUSTOMERS
create policy "Enable all for authenticated users" on public.customers for all using (auth.role() = 'authenticated');

-- INVENTORY
create policy "Enable all for authenticated users" on public.inventory_items for all using (auth.role() = 'authenticated');

-- EXPENSES
create policy "Enable all for authenticated users" on public.expenses for all using (auth.role() = 'authenticated');

-- EXPENSE CATEGORIES
create policy "Enable all for authenticated users" on public.expense_categories for all using (auth.role() = 'authenticated');

-- ORDERS
create policy "Enable all for authenticated users" on public.orders for all using (auth.role() = 'authenticated');

-- ORDER ITEMS
create policy "Enable all for authenticated users" on public.order_items for all using (auth.role() = 'authenticated');

-- PAYMENT METHODS
create policy "Enable all for authenticated users" on public.payment_methods for all using (auth.role() = 'authenticated');

-- SETTINGS
create policy "Enable all for authenticated users" on public.settings for all using (auth.role() = 'authenticated');


-- Initial Data Seeding (Optional, for easy start)
insert into public.payment_methods (name) values ('Cash'), ('Vodafone Cash'), ('InstaPay') on conflict do nothing;

insert into public.settings (key, value, description) values 
('default_bw_cost', '0.50', 'Default cost for B&W print per page'),
('default_color_cost', '2.00', 'Default cost for Color print per page'),
('default_margin_percent', '20', 'Default profit margin percentage')
on conflict do nothing;
