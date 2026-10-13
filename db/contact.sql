-- Contact details shown on the contact, privacy and accessibility pages,
-- edited in the admin Settings tab. Safe to re-run.
alter table public.site_settings add column if not exists contact_email text not null default '';
alter table public.site_settings add column if not exists contact_phone text not null default '';
alter table public.site_settings add column if not exists accessibility_coordinator text not null default '';
