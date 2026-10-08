# Roadmap

- [x] Products table + RLS + storage policies (migration 0002)
- [x] Re-run db/products-setup.sql (idempotent) — verified 136 rows + product-images bucket (private; public blocked by workspace policy)
- [x] Product photos served through the site at `/product-images/<file>` (private bucket)
- [x] Admin area: orders (open/completed, status changes) and products (add/edit/hide/delete, photo upload)
- [x] Login/signup page (`/login`) and customer area (`/account`) with order history
- [ ] Enable email/password sign-up in the auth settings (currently returns "signups disabled")
- [ ] Owner registers with chagit222469@gmail.com and gets the admin role (insert into public.user_roles)
- [x] Site catalog reads products from the database (order prices computed on the server)
- [x] Recipient name/phone fields in checkout
- [ ] Real credit-card charging (no payment provider connected yet)
