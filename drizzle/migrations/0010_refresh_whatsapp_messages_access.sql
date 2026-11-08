create table if not exists public.wa_messages (
  id uuid primary key default gen_random_uuid(),
  wa_id text not null,
  contact_name text not null default '',
  direction text not null check (direction in ('in', 'out')),
  body text not null default '',
  wa_message_id text unique,
  status text not null default '',
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists wa_messages_wa_id_created on public.wa_messages (wa_id, created_at);
grant select, update on public.wa_messages to authenticated;
grant all on public.wa_messages to service_role;
alter table public.wa_messages enable row level security;
drop policy if exists "admins read wa messages" on public.wa_messages;
create policy "admins read wa messages" on public.wa_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins update wa messages" on public.wa_messages;
create policy "admins update wa messages" on public.wa_messages for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));