# Razorpay Setup

This repo now uses a secure server-side Razorpay flow:

1. Frontend calls `create-razorpay-order`
2. Razorpay Checkout opens
3. Frontend sends payment response to `verify-razorpay-payment`
4. Booking is marked `confirmed` only after signature + payment verification
5. Webhook (`razorpay-webhook`) keeps state in sync for async success/failure events

## 1) Run SQL migration

In Supabase SQL editor, run:

- [`supabase/razorpay_payment_setup.sql`](/Users/mani/Desktop/theZone/supabase/razorpay_payment_setup.sql)

## 2) Set Supabase function secrets

From the project root:

```bash
supabase secrets set \
  SUPABASE_URL="https://<PROJECT_REF>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>" \
  RAZORPAY_KEY_ID="<YOUR_RAZORPAY_KEY_ID>" \
  RAZORPAY_KEY_SECRET="<YOUR_RAZORPAY_KEY_SECRET>" \
  RAZORPAY_WEBHOOK_SECRET="<YOUR_RAZORPAY_WEBHOOK_SECRET>" \
  RAZORPAY_CHECKOUT_NAME="The Zone" \
  BOOKING_HOLD_MINUTES="15"
```

## 3) Deploy Edge Functions

These are called from the public booking page, so deploy with JWT verification disabled:

```bash
supabase functions deploy create-razorpay-order --no-verify-jwt
supabase functions deploy verify-razorpay-payment --no-verify-jwt
supabase functions deploy record-razorpay-failure --no-verify-jwt
supabase functions deploy razorpay-webhook --no-verify-jwt
```

## 4) Configure Razorpay webhook

In Razorpay Dashboard:

1. Go to **Webhooks**
2. Add endpoint:
   - `https://<PROJECT_REF>.supabase.co/functions/v1/razorpay-webhook`
3. Set the same webhook secret as `RAZORPAY_WEBHOOK_SECRET`
4. Subscribe to events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`

## 5) Functional behavior

- Slot is temporarily held with status `payment_initiated` during checkout
- On verified capture, booking becomes `confirmed`
- If checkout fails/closes, booking becomes `payment_failed`
- Stale holds automatically move to `payment_expired` when new checkouts are started

## 6) Security

Never put `RAZORPAY_KEY_SECRET` in frontend `.env` or source files.
