-- Razorpay payment flow setup for The Zone
-- Run this once in Supabase SQL editor before deploying the Edge Functions.

-- 1) bookings enhancements for payment lifecycle
alter table public.bookings
  add column if not exists hold_expires_at timestamptz,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_failure_reason text,
  add column if not exists razorpay_signature text,
  add column if not exists payment_provider text default 'razorpay',
  add column if not exists payment_currency text default 'INR';

-- 2) payments table (create if missing, extend if present)
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  amount integer not null,
  status text not null,
  provider text default 'razorpay',
  created_at timestamptz default now()
);

alter table public.payments
  add column if not exists provider_order_id text,
  add column if not exists provider_payment_id text,
  add column if not exists signature text,
  add column if not exists failure_reason text,
  add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists idx_payments_booking_id on public.payments (booking_id);
create index if not exists idx_payments_provider_order_id on public.payments (provider_order_id);
create index if not exists idx_payments_provider_payment_id on public.payments (provider_payment_id);

-- 3) Slot locking index
-- Existing docs use unique_booking_slot. We replace it with a status-aware index so
-- failed/expired/cancelled attempts do not permanently block a slot.
drop index if exists public.unique_booking_slot;

create unique index if not exists unique_active_booking_slot
on public.bookings (booking_date, time_slot)
where status in ('pending', 'payment_initiated', 'confirmed', 'paid');

-- 4) Razorpay order ID uniqueness for idempotency
create unique index if not exists unique_bookings_razorpay_order
on public.bookings (razorpay_order_id)
where razorpay_order_id is not null;
