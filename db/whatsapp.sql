-- WhatsApp chat: messages customers send to the shop's WhatsApp number (via
-- the WhatsApp Cloud API webhook) and the replies sent from the admin area.
-- Rows are written by the server; admins read them and mark them read.
-- Safe to run more than once.
create table if not exists public.wa_messages (
  id uuid primary key default gen_random_uuid(),
  wa_id text not null,                 -- customer's number, international digits (e.g. 9725...)
  contact_name text not null default '',
  direction text not null check (direction in ('in', 'out')),
  body text not null default '',
  wa_message_id text unique,           -- WhatsApp's id, to ignore repeated deliveries
  status text not null default '',     -- for replies: sent / delivered / read / failed
  created_at timestamptz not null default now(),
  read_at timestamptz                  -- when the shop owner opened an incoming message
);
create index if not exists wa_messages_wa_id_created on public.wa_messages (wa_id, created_at);

alter table public.wa_messages enable row level security;
drop policy if exists "admins read wa messages" on public.wa_messages;
create policy "admins read wa messages" on public.wa_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins update wa messages" on public.wa_messages;
create policy "admins update wa messages" on public.wa_messages for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
