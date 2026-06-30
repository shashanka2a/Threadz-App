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
  payment_method text not null,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  tax numeric(10, 2) not null check (tax >= 0),
  shipping_cost numeric(10, 2) default 0,
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

-- ---------------------------------------------------------------------------
-- Customer profiles (linked to Supabase Auth)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Saved shipping addresses
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_addresses_user_id on public.addresses (user_id);
create index if not exists idx_addresses_user_default on public.addresses (user_id, is_default);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.addresses
    set is_default = false, updated_at = now()
    where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_addresses_single_default on public.addresses;
create trigger trg_addresses_single_default
  before insert or update of is_default on public.addresses
  for each row execute function public.ensure_single_default_address();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users read own addresses" on public.addresses;
create policy "Users read own addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own addresses" on public.addresses;
create policy "Users insert own addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own addresses" on public.addresses;
create policy "Users update own addresses"
  on public.addresses for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own addresses" on public.addresses;
create policy "Users delete own addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Delhivery shipments
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists shipping_cost numeric(10, 2) default 0;

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  waybill text unique,
  delhivery_status text not null default 'pending',
  payment_mode text not null default 'Prepaid',
  shipping_cost numeric(10, 2),
  weight_grams integer not null default 250,
  label_data jsonb,
  tracking_status text,
  tracking_data jsonb,
  pickup_location text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shipments_order_id on public.shipments (order_id);
create index if not exists idx_shipments_waybill on public.shipments (waybill);

drop trigger if exists trg_shipments_updated_at on public.shipments;
create trigger trg_shipments_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();

alter table public.shipments enable row level security;

drop policy if exists "Users read own shipments" on public.shipments;
create policy "Users read own shipments"
  on public.shipments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and lower(o.email) = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and lower(o.email) = lower(auth.jwt() ->> 'email')
    )
  );
