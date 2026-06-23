alter table public.site_catalog
  add column if not exists announce_templates jsonb not null default '[]'::jsonb;
