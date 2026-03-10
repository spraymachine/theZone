import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildMergedNotes, calculateAmountInInr, normalizePayload, rangesOverlap, toMinutes } from '../_shared/booking.ts'
import { corsHeaders, jsonResponse } from '../_shared/http.ts'
import { fetchRazorpay } from '../_shared/razorpay.ts'

const HOLD_MINUTES = Number(Deno.env.get('BOOKING_HOLD_MINUTES') ?? '15')
const ACTIVE_STATUSES = ['pending', 'payment_initiated', 'confirmed', 'paid']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

  if (!supabaseUrl || !serviceRoleKey || !razorpayKeyId || !razorpayKeySecret) {
    return jsonResponse({ error: 'Missing required environment secrets.' }, 500)
  }

  let payload: ReturnType<typeof normalizePayload>
  try {
    const body = await req.json()
    payload = normalizePayload(body?.booking ?? body?.form ?? body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request payload.'
    return jsonResponse({ error: message }, 400)
  }

  const amountInInr = calculateAmountInInr(payload.date, payload.hours, payload.addOns)
  const startMinutes = toMinutes(payload.startTime)
  if (startMinutes === null) {
    return jsonResponse({ error: 'Invalid start time.' }, 400)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const nowIso = new Date().toISOString()

  // Release stale payment holds before checking conflicts.
  await supabaseAdmin
    .from('bookings')
    .update({ status: 'payment_expired', payment_failure_reason: 'Payment window expired.' })
    .eq('status', 'payment_initiated')
    .lt('hold_expires_at', nowIso)

  const { data: existingBookings, error: existingError } = await supabaseAdmin
    .from('bookings')
    .select('id, time_slot, duration, status, hold_expires_at')
    .eq('booking_date', payload.date)
    .in('status', ACTIVE_STATUSES)

  if (existingError) {
    return jsonResponse({ error: 'Failed to check slot availability.' }, 500)
  }

  const requestedEnd = startMinutes + payload.hours * 60

  for (const booking of existingBookings ?? []) {
    const status = String(booking.status || '').toLowerCase()

    if (status === 'payment_initiated' && booking.hold_expires_at) {
      const holdExpiryMs = new Date(booking.hold_expires_at).getTime()
      if (Number.isFinite(holdExpiryMs) && holdExpiryMs < Date.now()) {
        continue
      }
    }

    const existingStart = toMinutes(String(booking.time_slot || ''))
    if (existingStart === null) continue

    const existingDuration = Number(booking.duration || 0) || 1
    const existingEnd = existingStart + existingDuration * 60

    if (rangesOverlap(startMinutes, requestedEnd, existingStart, existingEnd)) {
      return jsonResponse(
        {
          error: 'This slot is no longer available. Please choose a different time.'
        },
        409
      )
    }
  }

  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString()

  const { data: booking, error: insertError } = await supabaseAdmin
    .from('bookings')
    .insert([
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        event_type: payload.eventType,
        booking_date: payload.date,
        time_slot: payload.startTime,
        duration: payload.hours,
        guests: payload.guests,
        notes: buildMergedNotes(payload),
        amount: amountInInr,
        status: 'payment_initiated',
        hold_expires_at: holdExpiresAt,
        payment_provider: 'razorpay',
        payment_currency: 'INR'
      }
    ])
    .select('id, amount, booking_date, time_slot, duration, name, email, phone')
    .single()

  if (insertError || !booking) {
    if (insertError?.code === '23505') {
      return jsonResponse({ error: 'This slot has just been taken. Please pick another slot.' }, 409)
    }
    return jsonResponse({ error: 'Failed to create booking intent.' }, 500)
  }

  const orderRes = await fetchRazorpay('orders', razorpayKeyId, razorpayKeySecret, {
    method: 'POST',
    body: {
      amount: booking.amount * 100,
      currency: 'INR',
      receipt: `booking_${booking.id}`.slice(0, 40),
      notes: {
        booking_id: booking.id,
        booking_date: booking.booking_date,
        time_slot: booking.time_slot
      }
    }
  })

  const orderBody = await orderRes.json().catch(() => null)

  if (!orderRes.ok || !orderBody?.id) {
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'payment_failed', payment_failure_reason: 'Failed to create Razorpay order.' })
      .eq('id', booking.id)

    return jsonResponse({ error: 'Unable to initialize payment. Please try again.' }, 502)
  }

  const { error: updateOrderError } = await supabaseAdmin
    .from('bookings')
    .update({ razorpay_order_id: orderBody.id })
    .eq('id', booking.id)

  if (updateOrderError) {
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'payment_failed', payment_failure_reason: 'Failed to attach Razorpay order.' })
      .eq('id', booking.id)

    return jsonResponse({ error: 'Unable to initialize payment. Please try again.' }, 500)
  }

  // Audit insert; do not fail checkout if audit write fails.
  await supabaseAdmin.from('payments').insert([
    {
      booking_id: booking.id,
      amount: booking.amount,
      provider: 'razorpay',
      status: 'created',
      provider_order_id: orderBody.id,
      metadata: {
        source: 'book_now',
        hold_expires_at: holdExpiresAt
      }
    }
  ])

  return jsonResponse({
    ok: true,
    bookingId: booking.id,
    razorpayOrderId: orderBody.id,
    amount: orderBody.amount,
    currency: orderBody.currency,
    keyId: razorpayKeyId,
    holdExpiresAt,
    checkoutName: Deno.env.get('RAZORPAY_CHECKOUT_NAME') || 'The Zone',
    checkoutDescription: `Booking for ${payload.date} at ${payload.startTime}`
  })
})
