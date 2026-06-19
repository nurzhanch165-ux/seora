-- Локализация контента товаров (ru/en/ko)
alter table public.products
  add column if not exists i18n jsonb not null default '{}'::jsonb;
