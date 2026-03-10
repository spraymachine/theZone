import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/http.ts'

type FailureRequest = {
  bookingId: string
  reason?: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  code?: string
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

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Missing required environment secrets.' }, 500)
  }

  let payload: FailureRequest
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400)
  }

  if (!payload.bookingId) {
    return jsonResponse({ error: 'bookingId is required.' }, 400)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('id, status, amount, razorpay_order_id')
    .eq('id', payload.bookingId)
    .single()

  if (bookingError || !booking) {
    return jsonResponse({ error: 'Booking not found.' }, 404)
  }

  const status = String(booking.status || '').toLowerCase()
  if (status === 'confirmed' || status === 'paid') {
    return jsonResponse({ ok: true, ignored: true })
  }

  const failureReason = String(payload.reason || 'Payment failed').slice(0, 500)

  const { error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({
      status: 'payment_failed',
      payment_failure_reason: payload.code ? `${payload.code}: ${failureReason}` : failureReason,
      hold_expires_at: null
    })
    .eq('id', booking.id)

  if (updateError) {
    return jsonResponse({ error: 'Failed to update booking failure state.' }, 500)
  }

  await supabaseAdmin.from('payments').insert([
    {
      booking_id: booking.id,
      amount: booking.amount,
      provider: 'razorpay',
      status: 'failed',
      provider_order_id: payload.razorpay_order_id || booking.razorpay_order_id,
      provider_payment_id: payload.razorpay_payment_id || null,
      failure_reason: payload.code ? `${payload.code}: ${failureReason}` : failureReason
    }
  ])

  return jsonResponse({ ok: true })
})
