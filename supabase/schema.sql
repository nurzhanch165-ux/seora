-- SonyShopKorea — схема базы данных Supabase
-- Применяется к новому проекту Supabase (через MCP execute_sql или SQL Editor).
-- Архитектура доступа:
--   products            — публичное чтение (anon); запись только через service_role (серверные роуты админки)
--   customers           — прямого доступа у anon нет; работа только через RPC (security definer) ниже
--   orders/order_items  — прямого доступа у anon нет; всё через серверные роуты с service_role
-- Пароли клиентов хранятся как bcrypt-хеш (pgcrypto) и НИКОГДА не отдаются клиенту.

-- В Supabase расширения ставятся в схему extensions; функции ниже включают её в search_path.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- =========================================================================
-- ТАБЛИЦЫ
-- =========================================================================

-- Клиенты (вход по логину/паролю, email необязателен)
create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  login           text not null,
  password_hash   text not null,
  last_name       text not null default '',
  first_name      text not null default '',
  middle_name     text not null default '',
  country         text not null default '',
  city            text not null default '',
  phone           text not null default '',
  whatsapp        text not null default '',
  telegram        text not null default '',
  email           text,
  agree_data      boolean not null default false,
  agree_marketing boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Уникальность логина (без учёта регистра) и телефона (без пробелов)
create unique index if not exists customers_login_norm_idx
  on public.customers (lower(login));
create unique index if not exists customers_phone_norm_idx
  on public.customers (regexp_replace(phone, '\s', '', 'g'))
  where phone is not null and phone <> '';

-- Каталог товаров (id сохраняем текстом: p01, h01, добавленные — ap...)
create table if not exists public.products (
  id                text primary key,
  slug              text not null unique,
  name              text not null,
  brand_slug        text not null default '',
  section_slug      text not null,
  category_slug     text not null default '',
  sub_slug          text not null default '',
  glyph             text not null default 'Sparkle',
  tone              text not null default 'sand',
  images            text[] not null default '{}',
  price             numeric not null default 0,
  old_price         numeric,
  short_description text not null default '',
  full_description  text not null default '',
  usage             text not null default '',
  result            text not null default '',
  how_to_use        text not null default '',
  volume            text not null default '',
  weight            text not null default '',
  shelf_life        text not null default '',
  months_supply     text not null default '',
  country           text not null default '',
  manufacturer      text not null default '',
  certificates      text[] not null default '{}',
  stock             integer not null default 0,
  rating            numeric not null default 0,
  reviews           integer not null default 0,
  tags              text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_section_idx on public.products (section_slug);
create index if not exists products_category_idx on public.products (category_slug);
create index if not exists products_brand_idx on public.products (brand_slug);

-- Заказы
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  number             text not null,
  customer_id        uuid references public.customers (id) on delete set null,
  customer           jsonb not null default '{}'::jsonb,  -- снимок контактов на момент заказа
  delivery           jsonb not null default '{}'::jsonb,
  total              numeric not null default 0,
  comment            text not null default '',
  status             text not null default 'new',
  payment_screenshot text,                                 -- путь в bucket payment-screenshots
  payment_confirmed  boolean not null default false,
  created_at         timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- Позиции заказа
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id text not null default '',
  slug       text not null default '',
  name       text not null default '',
  brand      text not null default '',
  price      numeric not null default 0,
  qty        integer not null default 1
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- =========================================================================
-- RLS
-- =========================================================================

alter table public.customers   enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Каталог: публичное чтение. Запись — только service_role (он обходит RLS), политик на запись нет.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated using (true);

-- customers / orders / order_items: политик нет — anon-ключ не имеет прямого доступа.
-- Доступ только через RPC (security definer) и серверные роуты с service_role.

-- =========================================================================
-- RPC: авторизация клиентов (security definer, не раскрывают password_hash)
-- =========================================================================

-- Безопасное представление клиента (без хеша пароля) в виде jsonb
create or replace function public.customer_json(c public.customers)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', c.id,
    'login', c.login,
    'lastName', c.last_name,
    'firstName', c.first_name,
    'middleName', c.middle_name,
    'country', c.country,
    'city', c.city,
    'phone', c.phone,
    'whatsapp', c.whatsapp,
    'telegram', c.telegram,
    'email', c.email,
    'agreeData', c.agree_data,
    'agreeMarketing', c.agree_marketing,
    'createdAt', c.created_at
  );
$$;

-- Регистрация. Возвращает { ok, error, customer }
create or replace function public.register_customer(
  p_login text,
  p_password text,
  p_last_name text,
  p_first_name text,
  p_middle_name text,
  p_country text,
  p_city text,
  p_phone text,
  p_whatsapp text,
  p_telegram text,
  p_email text,
  p_agree_data boolean,
  p_agree_marketing boolean
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_login text := trim(coalesce(p_login, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\s', '', 'g');
  v_row public.customers;
begin
  if length(v_login) < 3 then
    return jsonb_build_object('ok', false, 'error', 'Логин должен быть не короче 3 символов.');
  end if;
  if length(coalesce(p_password, '')) < 4 then
    return jsonb_build_object('ok', false, 'error', 'Пароль должен быть не короче 4 символов.');
  end if;
  if exists (select 1 from public.customers where lower(login) = lower(v_login)) then
    return jsonb_build_object('ok', false, 'error', 'Этот логин уже занят. Выберите другой.');
  end if;
  if v_phone <> '' and exists (
    select 1 from public.customers where regexp_replace(phone, '\s', '', 'g') = v_phone
  ) then
    return jsonb_build_object('ok', false, 'error', 'Клиент с таким телефоном уже зарегистрирован.');
  end if;

  insert into public.customers (
    login, password_hash, last_name, first_name, middle_name,
    country, city, phone, whatsapp, telegram, email,
    agree_data, agree_marketing
  ) values (
    v_login, crypt(p_password, gen_salt('bf')), coalesce(p_last_name, ''),
    coalesce(p_first_name, ''), coalesce(p_middle_name, ''), coalesce(p_country, ''),
    coalesce(p_city, ''), coalesce(p_phone, ''), coalesce(p_whatsapp, ''),
    coalesce(p_telegram, ''), nullif(trim(coalesce(p_email, '')), ''),
    coalesce(p_agree_data, false), coalesce(p_agree_marketing, false)
  ) returning * into v_row;

  return jsonb_build_object('ok', true, 'customer', public.customer_json(v_row));
end;
$$;

-- Вход. Логин ИЛИ телефон + пароль. Возвращает { ok, error, customer }
create or replace function public.authenticate_customer(
  p_login text,
  p_password text
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_login text := trim(coalesce(p_login, ''));
  v_phone text := regexp_replace(coalesce(p_login, ''), '\s', '', 'g');
  v_row public.customers;
begin
  select * into v_row from public.customers
  where lower(login) = lower(v_login)
     or (v_phone <> '' and regexp_replace(phone, '\s', '', 'g') = v_phone)
  limit 1;

  if v_row.id is null then
    return jsonb_build_object('ok', false, 'error', 'Клиент с таким логином не найден.');
  end if;
  if v_row.password_hash <> crypt(p_password, v_row.password_hash) then
    return jsonb_build_object('ok', false, 'error', 'Неверный пароль.');
  end if;

  return jsonb_build_object('ok', true, 'customer', public.customer_json(v_row));
end;
$$;

-- Смена пароля (нужен текущий пароль). { ok, error }
create or replace function public.change_password(
  p_id uuid,
  p_current text,
  p_new text
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_row public.customers;
begin
  select * into v_row from public.customers where id = p_id;
  if v_row.id is null then
    return jsonb_build_object('ok', false, 'error', 'Вы не авторизованы.');
  end if;
  if v_row.password_hash <> crypt(p_current, v_row.password_hash) then
    return jsonb_build_object('ok', false, 'error', 'Текущий пароль введён неверно.');
  end if;
  if length(coalesce(p_new, '')) < 4 then
    return jsonb_build_object('ok', false, 'error', 'Новый пароль должен быть не короче 4 символов.');
  end if;
  update public.customers set password_hash = crypt(p_new, gen_salt('bf')) where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- Сброс пароля по логину + телефону (без почты/SMS). { ok, error }
create or replace function public.reset_password(
  p_login text,
  p_phone text,
  p_new text
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\s', '', 'g');
  v_row public.customers;
begin
  select * into v_row from public.customers
  where lower(login) = lower(trim(coalesce(p_login, '')))
    and regexp_replace(phone, '\s', '', 'g') = v_phone
  limit 1;
  if v_row.id is null then
    return jsonb_build_object('ok', false, 'error', 'Не нашли аккаунт с таким логином и телефоном. Проверьте данные.');
  end if;
  if length(coalesce(p_new, '')) < 4 then
    return jsonb_build_object('ok', false, 'error', 'Новый пароль должен быть не короче 4 символов.');
  end if;
  update public.customers set password_hash = crypt(p_new, gen_salt('bf')) where id = v_row.id;
  return jsonb_build_object('ok', true);
end;
$$;

-- Обновление профиля (логин/данные). Проверка уникальности логина и телефона. { ok, error, customer }
create or replace function public.update_customer_profile(
  p_id uuid,
  p_login text,
  p_last_name text,
  p_first_name text,
  p_middle_name text,
  p_country text,
  p_city text,
  p_phone text,
  p_whatsapp text,
  p_telegram text,
  p_email text
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_login text := trim(coalesce(p_login, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\s', '', 'g');
  v_row public.customers;
begin
  if not exists (select 1 from public.customers where id = p_id) then
    return jsonb_build_object('ok', false, 'error', 'Вы не авторизованы.');
  end if;
  if length(v_login) < 3 then
    return jsonb_build_object('ok', false, 'error', 'Логин должен быть не короче 3 символов.');
  end if;
  if exists (select 1 from public.customers where lower(login) = lower(v_login) and id <> p_id) then
    return jsonb_build_object('ok', false, 'error', 'Этот логин уже занят.');
  end if;
  if v_phone <> '' and exists (
    select 1 from public.customers where regexp_replace(phone, '\s', '', 'g') = v_phone and id <> p_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'Этот телефон уже используется другим клиентом.');
  end if;

  update public.customers set
    login = v_login,
    last_name = coalesce(p_last_name, last_name),
    first_name = coalesce(p_first_name, first_name),
    middle_name = coalesce(p_middle_name, middle_name),
    country = coalesce(p_country, country),
    city = coalesce(p_city, city),
    phone = coalesce(p_phone, phone),
    whatsapp = coalesce(p_whatsapp, whatsapp),
    telegram = coalesce(p_telegram, telegram),
    email = nullif(trim(coalesce(p_email, '')), '')
  where id = p_id
  returning * into v_row;

  return jsonb_build_object('ok', true, 'customer', public.customer_json(v_row));
end;
$$;

-- Доступ к RPC: только функции, не таблицы
revoke all on function public.register_customer(text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) from public;
-- execute only via service role (server API)

revoke all on function public.authenticate_customer(text,text) from public;

revoke all on function public.change_password(uuid,text,text) from public;

revoke all on function public.reset_password(text,text,text) from public;

revoke all on function public.update_customer_profile(uuid,text,text,text,text,text,text,text,text,text,text) from public;
