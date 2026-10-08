-- Lets a product appear in several categories (chosen in the admin area).
-- Safe to re-run. `category` stays as the product's primary category.
alter table public.products add column if not exists categories text[] not null default '{}';
update public.products set categories = array[category] where cardinality(categories) = 0;
create index if not exists products_categories_idx on public.products using gin (categories);
