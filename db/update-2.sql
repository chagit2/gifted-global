-- Update 2 (run once; safe to re-run). Adds:
--  * several categories per product (same as products-multi-category.sql)
--  * out-of-stock flag for products
--  * desired delivery date, customer note, internal note, coupon and
--    shipping amounts on orders
--  * coupons table and site settings (shipping fee), admin-managed
--  * one copy of each sample gift instead of 17 (shown in every category)

-- Several categories per product
alter table public.products add column if not exists categories text[] not null default '{}';
update public.products set categories = array[category] where cardinality(categories) = 0;
create index if not exists products_categories_idx on public.products using gin (categories);

-- Out of stock: stays on the site but can't be ordered
alter table public.products add column if not exists in_stock boolean not null default true;

-- Order details
alter table public.orders
  add column if not exists delivery_date date,
  add column if not exists customer_note text not null default '',
  add column if not exists admin_note text not null default '',
  add column if not exists coupon_code text not null default '',
  add column if not exists discount numeric(10,2) not null default 0,
  add column if not exists shipping_fee numeric(10,2) not null default 0;

-- Coupons (checked on the server; only admins can see or edit them)
create table if not exists public.coupons (
  code text primary key check (code = upper(code) and length(code) between 2 and 40),
  kind text not null check (kind in ('percent', 'fixed')),
  amount numeric(10,2) not null check (amount > 0),
  active boolean not null default true,
  expires_on date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
drop policy if exists "admins manage coupons" on public.coupons;
create policy "admins manage coupons" on public.coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Site settings: a single row
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  shipping_fee numeric(10,2) not null default 50 check (shipping_fee >= 0)
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
drop policy if exists "anyone reads settings" on public.site_settings;
create policy "anyone reads settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admins update settings" on public.site_settings;
create policy "admins update settings" on public.site_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Sample gifts: keep one copy of each (the Rosh Hashana one) in every category,
-- and remove the other 16 copies. Products added in the admin area are untouched.
update public.products p
  set categories = array['rosh-hashana', 'sukkot', 'hanukkah', 'tu-bishvat', 'purim', 'pesach', 'shavuot', 'shabbat', 'birthday-child', 'birthday-teen', 'birthday-adult', 'baby', 'bar-mitzvah', 'bat-mitzvah', 'judaica', 'for-boy', 'for-girl']
  from (values ('candles'), ('perfume'), ('jewelry'), ('shabbat'), ('sweets'), ('book'), ('baby'), ('signature')) as k(key)
  where p.id = 'rosh-hashana-' || k.key;
delete from public.products p
  using (values ('rosh-hashana'), ('sukkot'), ('hanukkah'), ('tu-bishvat'), ('purim'), ('pesach'), ('shavuot'), ('shabbat'), ('birthday-child'), ('birthday-teen'), ('birthday-adult'), ('baby'), ('bar-mitzvah'), ('bat-mitzvah'), ('judaica'), ('for-boy'), ('for-girl')) as s(slug), (values ('candles'), ('perfume'), ('jewelry'), ('shabbat'), ('sweets'), ('book'), ('baby'), ('signature')) as k(key)
  where p.id = s.slug || '-' || k.key and s.slug <> 'rosh-hashana';
