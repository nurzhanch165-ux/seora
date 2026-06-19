-- Bucket для автоматических ежедневных Excel-файлов
insert into storage.buckets (id, name, public)
values ('daily-exports', 'daily-exports', false)
on conflict (id) do nothing;
