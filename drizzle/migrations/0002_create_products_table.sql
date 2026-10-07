-- Products catalog managed from the site's admin area.
create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  category text not null,
  name_he text not null default '',
  name_fr text not null default '',
  name_en text not null default '',
  subtitle_he text not null default '',
  subtitle_fr text not null default '',
  subtitle_en text not null default '',
  description_he text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  price numeric(10,2) not null check (price >= 0),
  images text[] not null default '{}',
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category, sort);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

drop policy if exists "anyone reads active products" on public.products;
create policy "anyone reads active products" on public.products for select to anon, authenticated
  using (active or public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins insert products" on public.products;
create policy "admins insert products" on public.products for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins update products" on public.products;
create policy "admins update products" on public.products for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins delete products" on public.products;
create policy "admins delete products" on public.products for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Product photos: only admins may upload, replace or delete.
drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
