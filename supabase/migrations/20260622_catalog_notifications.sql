-- i18n for products (if not applied)
alter table public.products
  add column if not exists i18n jsonb not null default '{}'::jsonb;

-- Custom brands & category additions (merged with static categories.ts)
create table if not exists public.site_catalog (
  id text primary key default 'main',
  extra_brands jsonb not null default '[]'::jsonb,
  extra_categories jsonb not null default '[]'::jsonb,
  extra_subcategories jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_catalog (id) values ('main') on conflict (id) do nothing;

alter table public.site_catalog enable row level security;
drop policy if exists site_catalog_public_read on public.site_catalog;
create policy site_catalog_public_read on public.site_catalog for select using (true);

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_customer_idx on public.push_subscriptions(customer_id);
alter table public.push_subscriptions enable row level security;

-- In-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_customer_idx on public.notifications(customer_id, created_at desc);
alter table public.notifications enable row level security;

-- Stream announcements log
create table if not exists public.stream_announcements (
  id uuid primary key default gen_random_uuid(),
  stream_id text,
  title text not null,
  body text not null default '',
  tiktok_url text,
  sent_email int not null default 0,
  sent_push int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.stream_announcements enable row level security;
