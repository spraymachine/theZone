# Working Supabase

This document explains how the frontend in this repo talks to Supabase and captures the exact database / RLS setup so you can recreate or extend it later.

---

## 1. Environment variables

The frontend uses Vite and reads Supabase credentials from environment variables:

```js
// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Steps

1. In the Supabase dashboard, go to **Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
2. In this project, create a `.env` file (not committed to git) with:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

3. Restart `npm run dev` after changing `.env`.

---

## 2. Database schema (SQL)

The app uses three main tables: `bookings`, `payments`, and `admins`.

### 2.1 `bookings` table

```sql
create table public.bookings (
  id uuid default gen_random_uuid() primary key,

  name text not null,
  email text not null,
  phone text not null,

  booking_date date not null,
  time_slot text not null,

  amount integer not null,

  status text default 'pending', -- pending | paid | cancelled

  razorpay_order_id text,
  razorpay_payment_id text,

  created_at timestamp with time zone default now()
);

-- Later schema extensions
alter table public.bookings
  add column if not exists duration integer not null default 1;

alter table public.bookings
  add column if not exists event_type text not null default 'other';

alter table public.bookings
  add column if not exists guests integer not null default 1,
  add column if not exists notes text;

-- Prevent double–booking the same slot
create unique index if not exists unique_booking_slot
on public.bookings (booking_date, time_slot);
```

### 2.2 `payments` table

```sql
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,

  booking_id uuid references public.bookings(id) on delete cascade,
  amount integer not null,
  status text not null,
  provider text default 'razorpay',

  created_at timestamp with time zone default now()
);
```

### 2.3 `admins` table

```sql
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
```

> Tip: Run all the SQL in the Supabase dashboard under **SQL → New query**.

---

## 3. Row Level Security (RLS) and policies

Goal:

- Anyone (anonymous) can **insert** into `public.bookings` (public booking form)
- Only admins can **select / update / delete** from `public.bookings` (admin dashboard)
- Admins are users whose `auth.users.id` exists in `public.admins.user_id`

All of this is also stored as a reference in `supabase/admins_and_bookings_rls.sql`.

### 3.1 Enable RLS

```sql
alter table public.admins enable row level security;
alter table public.bookings enable row level security;
```

### 3.2 `admins` policies

```sql
-- Allow a logged-in user to check whether THEY are an admin
drop policy if exists "admins_read_own_row" on public.admins;
create policy "admins_read_own_row"
on public.admins
for select
to authenticated
using (user_id = auth.uid());

-- Disallow non-privileged writes to admins via RLS
drop policy if exists "admins_no_write" on public.admins;
create policy "admins_no_write"
on public.admins
for all
to authenticated, anon
using (false)
with check (false);
```

### 3.3 `bookings` policies

```sql
-- Clean up any previous policies (optional but recommended during setup)
drop policy if exists "bookings_anon_insert" on public.bookings;
drop policy if exists "bookings_auth_insert" on public.bookings;
drop policy if exists "bookings_admin_select" on public.bookings;
drop policy if exists "bookings_admin_update" on public.bookings;
drop policy if exists "bookings_admin_delete" on public.bookings;

-- Public booking form: allow anonymous inserts
create policy "bookings_anon_insert"
on public.bookings
for insert
to anon
with check (true);

-- Allow authenticated users (including admins) to insert bookings
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
using (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

-- Admin-only update (edit / cancel)
create policy "bookings_admin_update"
on public.bookings
for update
to authenticated
using (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);

-- Admin-only delete
create policy "bookings_admin_delete"
on public.bookings
for delete
to authenticated
using (
  exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  )
);
```

### 3.4 Marking a user as admin

1. In Supabase **Authentication → Users**, create/invite the admin user.
2. Copy their `id` (UUID).
3. Insert that UUID into `public.admins`:

```sql
insert into public.admins (user_id)
values ('00000000-0000-0000-0000-000000000000'); -- replace with real auth.users.id
```

---

## 4. How the frontend uses Supabase

### 4.1 Public booking form (`BookNow`)

File: `src/pages/BookNow.jsx`

- **Check availability** for a given date:

```js
const { data, error } = await supabase
  .from('bookings')
  .select('id, time_slot, duration, status')
  .eq('booking_date', form.date)
```

- **Insert a new booking** (anonymous user):

```js
const bookingPayload = {
  name: form.name,
  email: form.email,
  phone: form.phone,
  event_type: form.eventType,
  booking_date: form.date,
  time_slot: form.startTime,
  duration: Number(form.hours),
  guests: Number(form.guests || 0),
  notes: mergedNotes,              // can be null
  amount: Math.round(estimatedTotal),
  status: 'pending'
}

const { error } = await supabase
  .from('bookings')
  .insert([bookingPayload])
```

For this to work:

- `bookings` must allow `insert` for `anon` (see `bookings_anon_insert` policy).
- All the referenced columns must exist in the `bookings` table (see schema above).

### 4.2 Admin login (`AdminLogin`)

File: `src/pages/AdminLogin.jsx`

```js
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

Requirements:

- The admin user must exist in **Auth → Users**.
- That user’s `id` must be present in `public.admins.user_id` for them to see / edit bookings.

### 4.3 Admin dashboard (`AdminDashboard`)

File: `src/pages/AdminDashboard.jsx`

- **Fetch bookings** (admins only, enforced by RLS):

```js
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .order('booking_date', { ascending: false })
  .order('time_slot', { ascending: true })
```

- **Create booking from dashboard**:

```js
const { data, error } = await supabase
  .from('bookings')
  .insert([payload])
  .select('*')
  .single()
```

- **Update booking**:

```js
const { data, error } = await supabase
  .from('bookings')
  .update(patch)
  .eq('id', editForm.id)
  .select('*')
  .single()
```

- **Soft cancel booking**:

```js
const { data, error } = await supabase
  .from('bookings')
  .update({ status: 'cancelled' })
  .eq('id', selected.id)
  .select('*')
  .single()
```

- **Hard delete booking**:

```js
const { error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', selected.id)
```

RLS ensures only authenticated admins (present in `admins`) can perform these operations.

---

## 5. Checklist for wiring up a new environment

1. Create a new Supabase project.
2. Run all schema + RLS SQL from this file (and/or from `supabase/admins_and_bookings_rls.sql`).
3. Create at least one admin user in **Auth → Users** and insert their `id` into `public.admins`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
5. Run `npm run dev` locally or `npm run build` for production.
6. Test:
   - Public booking form can submit as an anonymous user.
   - Admin can log in and see / edit / delete bookings.


