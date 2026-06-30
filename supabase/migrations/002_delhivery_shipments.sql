-- Delhivery shipments linked to orders
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

alter table public.orders
  add column if not exists shipping_cost numeric(10, 2) default 0;

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
