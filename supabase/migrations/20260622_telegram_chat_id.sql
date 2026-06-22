alter table public.customers
  add column if not exists telegram_chat_id text;

create index if not exists customers_telegram_chat_idx
  on public.customers (telegram_chat_id)
  where telegram_chat_id is not null and telegram_chat_id <> '';

alter table public.stream_announcements
  add column if not exists sent_telegram int not null default 0;
