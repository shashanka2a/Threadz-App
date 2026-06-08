-- THREADZ — full database schema
-- Run via: npm run db:setup   (requires SUPABASE_DB_URL in .env.local)
-- Or paste into Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Categories (shop taxonomy)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products (catalog + per-size stock)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  category_id text references public.categories (id) on delete restrict,
  name text not null,
  description text not null,
  quality text not null,
  color text not null,
  price numeric(10, 2) not null check (price >= 0),
  mrp numeric(10, 2) not null check (mrp >= 0),
  image text not null,
  category text not null,
  gsm text not null default '',
  size_s integer not null default 0 check (size_s >= 0),
  size_m integer not null default 0 check (size_m >= 0),
  size_l integer not null default 0 check (size_l >= 0),
  size_xl integer not null default 0 check (size_xl >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders (checkout)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  full_name text not null,
  phone text not null,
  email text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  payment_method text not null check (payment_method in ('upi', 'card', 'cod')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  tax numeric(10, 2) not null check (tax >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'confirmed' check (
    status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Order line items (snapshot at purchase time)
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id) on delete restrict,
  product_name text not null,
  color text not null,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_email on public.orders (email);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- Triggers: updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: decrement stock when an order line is placed
-- ---------------------------------------------------------------------------
create or replace function public.decrement_product_stock()
returns trigger
language plpgsql
as $$
begin
  if upper(new.size) = 'S' then
    update public.products
    set
      size_s = greatest(size_s - new.quantity, 0),
      quantity = greatest(quantity - new.quantity, 0),
      updated_at = now()
    where id = new.product_id;
  elsif upper(new.size) = 'M' then
    update public.products
    set
      size_m = greatest(size_m - new.quantity, 0),
      quantity = greatest(quantity - new.quantity, 0),
      updated_at = now()
    where id = new.product_id;
  elsif upper(new.size) = 'L' then
    update public.products
    set
      size_l = greatest(size_l - new.quantity, 0),
      quantity = greatest(quantity - new.quantity, 0),
      updated_at = now()
    where id = new.product_id;
  elsif upper(new.size) = 'XL' then
    update public.products
    set
      size_xl = greatest(size_xl - new.quantity, 0),
      quantity = greatest(quantity - new.quantity, 0),
      updated_at = now()
    where id = new.product_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_order_items_decrement_stock on public.order_items;
create trigger trg_order_items_decrement_stock
  after insert on public.order_items
  for each row execute function public.decrement_product_stock();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Categories: public read
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  using (true);

-- Products: public read active catalog
drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select
  using (is_active = true);

-- Products: allow seeding / admin writes via publishable key (dev setup)
drop policy if exists "Public insert products" on public.products;
create policy "Public insert products"
  on public.products for insert
  with check (true);

drop policy if exists "Public update products" on public.products;
create policy "Public update products"
  on public.products for update
  using (true);

-- Orders: storefront can create orders
drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders for insert
  with check (true);

-- Order items: storefront can create line items
drop policy if exists "Public insert order items" on public.order_items;
create policy "Public insert order items"
  on public.order_items for insert
  with check (true);

-- Note: admin reads (orders/inventory) use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- THREADZ — seed categories + product catalog (14 SKUs)
-- Safe to re-run (uses ON CONFLICT)

insert into public.categories (id, name, description, sort_order)
values
  (
    'plain',
    'Plain T-Shirts',
    'Classic fit tees in premium cotton blends and interlock fabrics',
    1
  ),
  (
    'oversized',
    'Oversized T-Shirts',
    'Relaxed oversized fit in heavy jersey cotton',
    2
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.products (
  id,
  category_id,
  name,
  description,
  quality,
  color,
  price,
  mrp,
  image,
  category,
  gsm,
  size_s,
  size_m,
  size_l,
  size_xl,
  quantity
)
values
  (
    '1',
    'plain',
    'Charcoal Melange Plain Tee',
    'Charcoal Melange plain tee in a breathable cotton-poly blend for everyday wear.',
    '55% cotton 45% polyester 180 GSM',
    'Charcoal Melange',
    499,
    899,
    'https://raw.githubusercontent.com/shashanka2a/Threadz-App/refs/heads/main/assets/charcoal.png',
    'Plain T-Shirts',
    '180 GSM',
    8, 8, 8, 8, 32
  ),
  (
    '2',
    'plain',
    'Grey Melange Plain Tee',
    'Grey Melange plain tee in premium cotton for all-day comfort.',
    '93% cotton 7% polyester 180 GSM',
    'Grey Melange',
    499,
    899,
    'https://raw.githubusercontent.com/shashanka2a/Threadz-App/refs/heads/main/assets/grey.png',
    'Plain T-Shirts',
    '180 GSM',
    6, 6, 6, 6, 24
  ),
  (
    '3',
    'plain',
    'Cream Plain Tee',
    'Cream plain tee in premium cotton for all-day comfort.',
    '100% cotton 180 GSM',
    'Cream',
    499,
    899,
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '180 GSM',
    7, 7, 7, 7, 28
  ),
  (
    '4',
    'plain',
    'LT Green Plain Tee',
    'LT Green plain tee in premium cotton for all-day comfort.',
    '100% cotton 180 GSM',
    'LT Green',
    499,
    899,
    'https://images.unsplash.com/photo-1680292783974-a9a336c10366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '180 GSM',
    7, 7, 7, 7, 28
  ),
  (
    '5',
    'plain',
    'Plum Plain Tee',
    'Plum plain tee in premium cotton for all-day comfort.',
    '100% cotton 180 GSM',
    'Plum',
    499,
    899,
    'https://images.unsplash.com/photo-1601056639638-c53c50e13ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '180 GSM',
    7, 7, 7, 7, 28
  ),
  (
    '6',
    'plain',
    'P.T Blue Plain Tee',
    'P.T Blue plain tee in premium cotton for all-day comfort.',
    '100% cotton 180 GSM',
    'P.T Blue',
    499,
    899,
    'https://images.unsplash.com/photo-1613461920867-9ea115fee900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '180 GSM',
    9, 9, 9, 9, 36
  ),
  (
    '7',
    'plain',
    'Burgundy Plain Tee',
    'Burgundy plain tee in heavier 200 GSM cotton for extra durability.',
    '100% cotton 200 GSM',
    'Burgundy',
    599,
    999,
    'https://images.unsplash.com/photo-1651761179569-4ba2aa054997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '200 GSM',
    7, 7, 7, 7, 28
  ),
  (
    '8',
    'plain',
    'Dusty Rose Plain Tee',
    'Dusty Rose plain tee in heavier 200 GSM cotton for extra durability.',
    '100% cotton 200 GSM',
    'Dusty Rose',
    599,
    999,
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '200 GSM',
    8, 8, 8, 8, 32
  ),
  (
    '9',
    'plain',
    'Brown Plain Tee',
    'Brown plain tee in heavier 200 GSM cotton for extra durability.',
    '100% cotton 200 GSM',
    'Brown',
    599,
    999,
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '200 GSM',
    4, 5, 5, 5, 19
  ),
  (
    '10',
    'oversized',
    'Steel Grey Oversized Tee',
    'Steel Grey oversized tee in heavy jersey cotton with a relaxed streetwear fit.',
    'OVERSIZED 100% cotton Heavy Jersey 220 GSM',
    'Steel Grey',
    599,
    1299,
    'https://images.unsplash.com/photo-1680292783974-a9a336c10366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Oversized T-Shirts',
    '220 GSM',
    6, 6, 6, 6, 24
  ),
  (
    '11',
    'oversized',
    'Wild Ginger Oversized Tee',
    'Wild Ginger oversized tee in heavy jersey cotton with a relaxed streetwear fit.',
    'OVERSIZED 100% cotton Heavy Jersey 220 GSM',
    'Wild Ginger',
    599,
    1299,
    'https://images.unsplash.com/photo-1601056639638-c53c50e13ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Oversized T-Shirts',
    '220 GSM',
    5, 6, 6, 6, 23
  ),
  (
    '12',
    'oversized',
    'Moss Green Oversized Tee',
    'Moss Green oversized tee in heavy jersey cotton with a relaxed streetwear fit.',
    'OVERSIZED 100% cotton Heavy Jersey 220 GSM',
    'Moss Green',
    599,
    1299,
    'https://images.unsplash.com/photo-1613461920867-9ea115fee900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Oversized T-Shirts',
    '220 GSM',
    6, 6, 6, 6, 24
  ),
  (
    '13',
    'oversized',
    'Park Petrol Oversized Tee',
    'Park Petrol oversized tee in heavy jersey cotton with a relaxed streetwear fit.',
    'OVERSIZED 100% cotton Heavy Jersey 220 GSM',
    'Park Petrol',
    599,
    1299,
    'https://images.unsplash.com/photo-1651761179569-4ba2aa054997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Oversized T-Shirts',
    '220 GSM',
    6, 6, 6, 6, 24
  ),
  (
    '14',
    'plain',
    'Pink Plain Tee',
    'Pink plain tee in soft interlock cotton for a smooth, structured feel.',
    '100% cotton Interlock 220 GSM',
    'Pink',
    599,
    1199,
    'https://images.unsplash.com/photo-1601056639638-c53c50e13ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'Plain T-Shirts',
    '220 GSM',
    12, 12, 12, 11, 47
  )
on conflict (id) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  quality = excluded.quality,
  color = excluded.color,
  price = excluded.price,
  mrp = excluded.mrp,
  image = excluded.image,
  category = excluded.category,
  gsm = excluded.gsm,
  size_s = excluded.size_s,
  size_m = excluded.size_m,
  size_l = excluded.size_l,
  size_xl = excluded.size_xl,
  quantity = excluded.quantity,
  is_active = true,
  updated_at = now();
