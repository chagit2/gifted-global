-- Background images for printed letters (uploaded in the admin Settings tab).
-- Safe to re-run.
alter table public.site_settings add column if not exists letter_backgrounds text[] not null default '{}';
