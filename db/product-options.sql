-- Gift options: a gift can have choices the customer makes before adding it
-- to the cart, e.g. "Colour: silver / gold" for a Havdalah set.
-- Safe to run more than once.

-- [{ "name": {he, fr, en}, "values": [{he, fr, en}, ...] }, ...]
alter table public.products add column if not exists options jsonb not null default '[]';

-- What the customer chose, copied onto the order so it survives later edits:
-- [{ "name": {he, fr, en}, "value": {he, fr, en} }, ...]
alter table public.order_items add column if not exists choice jsonb not null default '[]';
