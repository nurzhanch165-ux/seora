-- Миграция: стримы, расширенные заказы, клиентская база
-- Применить через Supabase SQL Editor или MCP apply_migration

create table if not exists public.streams (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  stream_date date not null,
  ended_at    timestamptz not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.stream_products (
  id             uuid primary key default gen_random_uuid(),
  stream_id      uuid not null references public.streams (id) on delete cascade,
  product_id     text not null references public.products (id) on delete cascade,
  price_override numeric,
  stock          integer not null default 0,
  position       integer not null default 0,
  unique (stream_id, product_id)
);

create index if not exists stream_products_stream_idx on public.stream_products (stream_id);

alter table public.orders
  add column if not exists source text not null default 'catalog',
  add column if not exists stream_id uuid references public.streams (id) on delete set null,
  add column if not exists stream_name text,
  add column if not exists currency_code text not null default 'KRW',
  add column if not exists exchange_rate numeric,
  add column if not exists total_krw numeric,
  add column if not exists total_converted numeric,
  add column if not exists fee_amount numeric default 0,
  add column if not exists admin_comment text not null default '';

alter table public.order_items
  add column if not exists sku text not null default '',
  add column if not exists price_krw numeric,
  add column if not exists price_converted numeric;

alter table public.customers
  add column if not exists admin_comment text not null default '',
  add column if not exists zip text not null default '',
  add column if not exists address text not null default '';

alter table public.products
  add column if not exists sku text,
  add column if not exists active boolean not null default true;

alter table public.streams enable row level security;
alter table public.stream_products enable row level security;

create policy if not exists streams_public_read on public.streams for select using (true);
create policy if not exists stream_products_public_read on public.stream_products for select using (true);
