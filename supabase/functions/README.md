## Supabase Edge Functions (Mailjet)

This project uses a Supabase Edge Function to send booking confirmation emails via Mailjet, keeping API keys off the client.

### Function

- `send-booking-confirmation`

### Required secrets

Set these in your Supabase project (Function secrets):

- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAILJET_FROM_EMAIL` (must be a verified sender in Mailjet)
- `MAILJET_FROM_NAME` (optional, defaults to `The Zone`)

### CLI (example)

If you use the Supabase CLI, you can set secrets like:

```bash
supabase secrets set MAILJET_API_KEY="..." MAILJET_API_SECRET="..." MAILJET_FROM_EMAIL="bookings@yourdomain.com" MAILJET_FROM_NAME="The Zone"
```

Then deploy:

```bash
supabase functions deploy send-booking-confirmation
```

### Test payload

See `send-booking-confirmation/example.request.json` for a ready-to-use body you can send when invoking the function.

