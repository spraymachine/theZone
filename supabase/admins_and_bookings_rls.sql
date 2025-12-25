-- Admin-only dashboard support (Supabase SQL)
-- Run this in Supabase Dashboard -> SQL editor.
--
-- Goal:
-- - Anyone (anon) can INSERT into public.bookings (public booking form)
-- - Only admins can SELECT/UPDATE bookings (admin dashboard)
-- - Admins are defined by a row existing in public.admins with user_id = auth.uid()
--
-- Notes:
-- - You must create/invite the admin user in Auth first.
-- - Then insert that user's UUID into public.admins.user_id (see bottom).

-- 1) Admins table
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Allow a logged-in user to check whether THEY are an admin.
drop policy if exists "admins_read_own_row" on public.admins;
create policy "admins_read_own_row"
on public.admins
for select
to authenticated
using (user_id = auth.uid());

-- Optional hardening: disallow non-privileged inserts/updates/deletes via RLS.
-- (You can still manage admins via SQL editor/service role.)
drop policy if exists "admins_no_write" on public.admins;
create policy "admins_no_write"
on public.admins
for all
to authenticated, anon
using (false)
with check (false);

-- 2) Bookings policies
-- IMPORTANT: Enable RLS on bookings (if not already enabled)
alter table public.bookings enable row level security;

-- Remove existing permissive policies if you previously created any.
-- (If you have named policies you want to keep, delete/adjust these lines.)
drop policy if exists "bookings_anon_insert" on public.bookings;
drop policy if exists "bookings_admin_delete" on public.bookings;
drop policy if exists "bookings_admin_select" on public.bookings;
drop policy if exists "bookings_admin_update" on public.bookings;

-- Public booking form: allow anonymous inserts
create policy "bookings_anon_insert"
on public.bookings
for insert
to anon
with check (true);

-- Allow authenticated users to also insert bookings.
-- This fixes Admin Dashboard "Add booking" (admins are authenticated),
-- and also avoids breaking the public form if an admin is logged in.
drop policy if exists "bookings_auth_insert" on public.bookings;
create policy "bookings_auth_insert"
on public.bookings
for insert
to authenticated
with check (true);

-- Admin-only read
create policy "bookings_admin_select"
on public.bookings
for select
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admin-only update (covers cancel + edit)
create policy "bookings_admin_update"
on public.bookings
for update
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admin-only delete (permanent removal)
create policy "bookings_admin_delete"
on public.bookings
for delete
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- If you want to also allow authenticated users to insert bookings from the UI,
-- it's already enabled above as "bookings_auth_insert".

-- 3) Make a specific user an admin (example)
-- Replace the UUID with the Auth user's id from Authentication -> Users.
-- insert into public.admins (user_id) values ('00000000-0000-0000-0000-000000000000');


