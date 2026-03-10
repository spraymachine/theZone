import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hmacSha256Hex, timingSafeEqual } from '../_shared/razorpay.ts'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response('Missing required environment secrets.', { status: 500 })
  }

  const signature = req.headers.get('x-razorpay-signature') || ''
  const rawBody = await req.text()

  const expectedSignature = await hmacSha256Hex(webhookSecret, rawBody)
  if (!timingSafeEqual(expectedSignature, signature)) {
    return new Response('Invalid signature', { status: 401 })
  }

  let eventBody: Record<string, any>
  try {
    eventBody = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid webhook body', { status: 400 })
  }

  const event = String(eventBody.event || '')
  const payment = eventBody?.payload?.payment?.entity || {}
  const order = eventBody?.payload?.order?.entity || {}

  const orderId = String(payment.order_id || order.id || '')
  if (!orderId) {
    return new Response('ok', { status: 200 })
  }

  const paymentId = String(payment.id || '')
  const amountInInr = Math.round(Number(payment.amount || order.amount || 0) / 100)
  const nowIso = new Date().toISOString()

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id, status, amount')
    .eq('razorpay_order_id', orderId)
    .maybeSingle()

  if (!booking) {
    return new Response('ok', { status: 200 })
  }

  const status = String(booking.status || '').toLowerCase()

  if (event === 'payment.captured' || event === 'order.paid') {
    if (status !== 'confirmed' && status !== 'paid') {
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'confirmed',
          razorpay_payment_id: paymentId || null,
          payment_verified_at: nowIso,
          payment_failure_reason: null,
          hold_expires_at: null
        })
        .eq('id', booking.id)
    }

    await supabaseAdmin.from('payments').insert([
      {
        booking_id: booking.id,
        amount: amountInInr || booking.amount,
        provider: 'razorpay',
        status: 'captured',
        provider_order_id: orderId,
        provider_payment_id: paymentId || null,
        metadata: {
          event,
          source: 'webhook',
          received_at: nowIso
        }
      }
    ])
  }

  if (event === 'payment.failed') {
    if (status !== 'confirmed' && status !== 'paid') {
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'payment_failed',
          payment_failure_reason: String(payment.error_description || payment.error_reason || 'Payment failed'),
          hold_expires_at: null
        })
        .eq('id', booking.id)
    }

    await supabaseAdmin.from('payments').insert([
      {
        booking_id: booking.id,
        amount: amountInInr || booking.amount,
        provider: 'razorpay',
        status: 'failed',
        provider_order_id: orderId,
        provider_payment_id: paymentId || null,
        failure_reason: String(payment.error_description || payment.error_reason || 'Payment failed'),
        metadata: {
          event,
          source: 'webhook',
          received_at: nowIso
        }
      }
    ])
  }

  return new Response('ok', { status: 200 })
})
