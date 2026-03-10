import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/http.ts'
import { fetchRazorpay, hmacSha256Hex, timingSafeEqual } from '../_shared/razorpay.ts'

type VerifyRequest = {
  bookingId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

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

  let payload: VerifyRequest
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400)
  }

  if (!payload.bookingId || !payload.razorpay_order_id || !payload.razorpay_payment_id || !payload.razorpay_signature) {
    return jsonResponse({ error: 'Missing payment verification fields.' }, 400)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('id, amount, status, razorpay_order_id')
    .eq('id', payload.bookingId)
    .single()

  if (bookingError || !booking) {
    return jsonResponse({ error: 'Booking not found.' }, 404)
  }

  const currentStatus = String(booking.status || '').toLowerCase()
  if (currentStatus === 'confirmed' || currentStatus === 'paid') {
    return jsonResponse({ ok: true, alreadyConfirmed: true, bookingId: booking.id })
  }

  if (booking.razorpay_order_id && booking.razorpay_order_id !== payload.razorpay_order_id) {
    return jsonResponse({ error: 'Order id mismatch for this booking.' }, 400)
  }

  const expectedSignature = await hmacSha256Hex(
    razorpayKeySecret,
    `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`
  )

  if (!timingSafeEqual(expectedSignature, payload.razorpay_signature)) {
    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'payment_failed',
        payment_failure_reason: 'Razorpay signature verification failed.'
      })
      .eq('id', booking.id)

    await supabaseAdmin.from('payments').insert([
      {
        booking_id: booking.id,
        amount: booking.amount,
        provider: 'razorpay',
        status: 'failed',
        provider_order_id: payload.razorpay_order_id,
        provider_payment_id: payload.razorpay_payment_id,
        failure_reason: 'signature_mismatch'
      }
    ])

    return jsonResponse({ error: 'Payment signature verification failed.' }, 400)
  }

  const paymentRes = await fetchRazorpay(`payments/${payload.razorpay_payment_id}`, razorpayKeyId, razorpayKeySecret)
  const paymentBody = await paymentRes.json().catch(() => null)

  if (!paymentRes.ok || !paymentBody?.id) {
    return jsonResponse({ error: 'Unable to verify payment with Razorpay.' }, 502)
  }

  if (paymentBody.order_id !== payload.razorpay_order_id) {
    return jsonResponse({ error: 'Payment does not belong to this order.' }, 400)
  }

  if (Number(paymentBody.amount) !== Number(booking.amount) * 100) {
    return jsonResponse({ error: 'Paid amount mismatch.' }, 400)
  }

  let paymentStatus = String(paymentBody.status || '').toLowerCase()

  // Capture if payment is only authorized and not yet captured.
  if (paymentStatus === 'authorized') {
    const captureRes = await fetchRazorpay(
      `payments/${payload.razorpay_payment_id}/capture`,
      razorpayKeyId,
      razorpayKeySecret,
      {
        method: 'POST',
        body: {
          amount: Number(paymentBody.amount),
          currency: paymentBody.currency || 'INR'
        }
      }
    )

    const captureBody = await captureRes.json().catch(() => null)
    if (!captureRes.ok || !captureBody?.id) {
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'payment_failed',
          payment_failure_reason: 'Payment capture failed.'
        })
        .eq('id', booking.id)

      return jsonResponse({ error: 'Payment capture failed.' }, 400)
    }

    paymentStatus = String(captureBody.status || '').toLowerCase()
  }

  if (paymentStatus !== 'captured') {
    return jsonResponse({ error: `Payment is not captured yet (status: ${paymentStatus}).` }, 409)
  }

  const nowIso = new Date().toISOString()

  const { error: updateBookingError } = await supabaseAdmin
    .from('bookings')
    .update({
      status: 'confirmed',
      razorpay_order_id: payload.razorpay_order_id,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature,
      payment_verified_at: nowIso,
      payment_failure_reason: null,
      hold_expires_at: null
    })
    .eq('id', booking.id)

  if (updateBookingError) {
    return jsonResponse({ error: 'Payment verified but booking confirmation failed.' }, 500)
  }

  await supabaseAdmin.from('payments').insert([
    {
      booking_id: booking.id,
      amount: booking.amount,
      provider: 'razorpay',
      status: 'captured',
      provider_order_id: payload.razorpay_order_id,
      provider_payment_id: payload.razorpay_payment_id,
      signature: payload.razorpay_signature,
      metadata: {
        verified_at: nowIso
      }
    }
  ])

  return jsonResponse({
    ok: true,
    bookingId: booking.id,
    status: 'confirmed',
    razorpayOrderId: payload.razorpay_order_id,
    razorpayPaymentId: payload.razorpay_payment_id
  })
})
