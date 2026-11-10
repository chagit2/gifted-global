-- The products imported from Art Judaica are single items that customers put
-- into a custom gift box ("מארז בעיצוב אישי"), not ready-made boxes.
-- Only changes their type; price, visibility and photos stay as they are.
-- Safe to run more than once.
update public.products set kind = 'item' where id like 'art-%';
