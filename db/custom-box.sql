-- "Design your own box": besides ready-made boxes, the site sells single items
-- that the customer combines into one box. Safe to run more than once.

-- 'bundle' = a ready-made box (every existing product), 'item' = a single item
-- that is only sold inside a box the customer designs.
alter table public.products add column if not exists kind text not null default 'bundle';
alter table public.products drop constraint if exists products_kind_check;
alter table public.products add constraint products_kind_check check (kind in ('bundle', 'item'));

-- The least number of items a designed box may hold, edited in the admin Settings tab.
alter table public.site_settings add column if not exists box_min_items integer not null default 3;

-- What went into a designed box, copied onto the order so it survives later edits:
-- [{ "productId": "...", "name": {he, fr, en}, "choice": [...], "qty": 2, "unitPrice": 40 }, ...]
alter table public.order_items add column if not exists contents jsonb not null default '[]';
