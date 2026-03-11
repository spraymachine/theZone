## Supabase Edge Functions

This project now uses Supabase Edge Functions for Razorpay payment flow and optional booking confirmation email.

### Payment functions

- `create-razorpay-order`
- `verify-razorpay-payment`
- `record-razorpay-failure`
- `razorpay-webhook`

### Optional email function

- `send-booking-confirmation`

### Required payment secrets

Set these in Supabase project secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RAZORPAY_CHECKOUT_NAME` (optional)
- `BOOKING_HOLD_MINUTES` (optional, default `15`)

### Deploy (CLI)

```bash
supabase functions deploy create-razorpay-order --no-verify-jwt
supabase functions deploy verify-razorpay-payment --no-verify-jwt
supabase functions deploy record-razorpay-failure --no-verify-jwt
supabase functions deploy razorpay-webhook --no-verify-jwt
```

### SQL migration

Before deploying payment functions, run:

- `supabase/razorpay_payment_setup.sql`

### Email function notes

The email function uses Mailjet and still requires:

- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAILJET_FROM_EMAIL`
- `MAILJET_FROM_NAME` (optional)
