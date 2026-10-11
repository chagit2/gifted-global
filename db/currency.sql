-- Payment currency on orders: the rate used and the amount in that currency.
-- (orders.currency already exists, default 'ILS'.) Safe to run more than once.
alter table public.orders add column if not exists fx_rate numeric not null default 1;
alter table public.orders add column if not exists total_in_currency numeric;
