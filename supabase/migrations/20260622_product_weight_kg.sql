-- Вес товара в кг для расчёта доставки (авто из граммовки/объёма)
alter table public.products
  add column if not exists weight_kg numeric;

create index if not exists products_weight_kg_idx on public.products (weight_kg)
  where weight_kg is not null;
