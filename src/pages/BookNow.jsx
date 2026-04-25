import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TimePicker from '../components/TimePicker'
import MaterialDatePicker from '../components/MaterialDatePicker'
import { useGSAPScroll } from '../hooks/useGSAPScroll'
import { supabase } from '../supabaseClient'
import './BookNow.css'
import heroBg from '../assets/hero-bg.png'

const EVENT_TYPES = [
  { value: 'office', label: 'Private office' },
  { value: 'party', label: 'Party / Celebration' },
  { value: 'get_together', label: 'Get-together' },
  { value: 'conference', label: 'Conference / Meeting' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'other', label: 'Other' }
]

const MIN_HOURS = 3
const MAX_HOURS = 24
const WINDOW_START_MINUTES = 7 * 60
const WINDOW_END_MINUTES = 23 * 60
const AVAILABILITY_STEP_MINUTES = 1
const NON_BLOCKING_STATUSES = new Set(['cancelled', 'payment_failed', 'payment_expired'])

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

function timeToMinutes(timeStr) {
  if (!timeStr) return null
  const [hStr, mStr] = timeStr.split(':')
  const mins = Number(hStr) * 60 + Number(mStr)
  return Number.isFinite(mins) ? mins : null
}

function addMinutesToTimeStr(timeStr, minutesToAdd) {
  const startMinutes = timeToMinutes(timeStr)
  if (startMinutes === null) return null
  const total = startMinutes + minutesToAdd
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const hh = String(Math.floor(normalized / 60)).padStart(2, '0')
  const mm = String(normalized % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

function minutesToTimeStr(totalMinutes) {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const mm = String(totalMinutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

function format12Hour(time24) {
  if (!time24) return ''
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  if (!Number.isFinite(h)) return ''
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const period = h < 12 ? 'AM' : 'PM'
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function rangesOverlap(startA, endA, startB, endB) {
  if (endA <= startA) endA += 24 * 60
  if (endB <= startB) endB += 24 * 60
  return startA < endB && startB < endA
}

function loadRazorpayCheckoutScript() {
  if (window.Razorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-razorpay-checkout="true"]')
    if (existing) {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      setTimeout(() => resolve(!!window.Razorpay), 3500)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function BookNow() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [existingBookings, setExistingBookings] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  const [form, setForm] = useState({
    eventType: 'office',
    otherEventPurpose: '',
    date: '',
    startTime: '',
    hours: '3',
    guests: '10',
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  // Calculate pricing based on weekday/weekend
  const pricing = useMemo(() => {
    if (!form.date) {
      return { base: 0, additionalPerHour: 0, dayType: '' }
    }
    const date = new Date(form.date)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday - Thursday
      return { base: 5500, additionalPerHour: 1500, dayType: 'Weekday' }
    } else { // Friday - Sunday
      return { base: 6000, additionalPerHour: 1500, dayType: 'Weekend' }
    }
  }, [form.date])

  const baseTotal = useMemo(() => {
    const hours = Number(form.hours || 0)
    if (hours <= MIN_HOURS) return pricing.base
    const additionalHours = hours - MIN_HOURS
    return pricing.base + additionalHours * pricing.additionalPerHour
  }, [form.hours, pricing])

  const estimatedTotal = useMemo(() => baseTotal, [baseTotal])

  const estimatedEndTime = useMemo(() => {
    const minutes = Math.round(Number(form.hours || 0) * 60)
    if (!minutes) return null
    return addMinutesToTimeStr(form.startTime, minutes)
  }, [form.startTime, form.hours])

  const overlapConflict = useMemo(() => {
    if (!form.date || !form.startTime || !form.hours) return null
    const newStart = timeToMinutes(form.startTime)
    if (newStart === null) return null
    const newEnd = newStart + Number(form.hours) * 60

    for (const booking of existingBookings) {
      const status = String(booking.status || '').toLowerCase()
      if (NON_BLOCKING_STATUSES.has(status)) continue

      if (status === 'payment_initiated' && booking.hold_expires_at) {
        const expiry = new Date(booking.hold_expires_at).getTime()
        if (Number.isFinite(expiry) && expiry < Date.now()) continue
      }

      const existingStart = timeToMinutes(booking.time_slot)
      if (existingStart === null) continue
      const existingDuration = booking.duration || 2
      const existingEnd = existingStart + existingDuration * 60

      if (rangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
        return {
          booking,
          existingStart: format12Hour(booking.time_slot),
          existingEnd: format12Hour(addMinutesToTimeStr(booking.time_slot, existingDuration * 60))
        }
      }
    }
    return null
  }, [form.date, form.startTime, form.hours, existingBookings])

  const requestedDurationMinutes = useMemo(() => {
    const parsedHours = Number(form.hours)
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      return MIN_HOURS * 60
    }
    return Math.round(parsedHours * 60)
  }, [form.hours])

  const bookedRanges = useMemo(() => {
    return existingBookings
      .filter((booking) => {
        const status = String(booking.status || '').toLowerCase()
        if (NON_BLOCKING_STATUSES.has(status)) return false
        if (status === 'payment_initiated' && booking.hold_expires_at) {
          const expiry = new Date(booking.hold_expires_at).getTime()
          return !(Number.isFinite(expiry) && expiry < Date.now())
        }
        return true
      })
      .map((booking) => {
        const bookedHours = Number(booking.duration || 2)
        const bookedMinutes = Number.isFinite(bookedHours) && bookedHours > 0
          ? Math.round(bookedHours * 60)
          : 120
        return {
          start: booking.time_slot,
          end: addMinutesToTimeStr(booking.time_slot, bookedMinutes)
        }
      })
      .filter((range) => range.start && range.end)
  }, [existingBookings])

  const slotStatusByValue = useMemo(() => {
    if (!form.date) return {}

    const statusMap = {}
    for (let slotStart = WINDOW_START_MINUTES; slotStart <= WINDOW_END_MINUTES; slotStart += AVAILABILITY_STEP_MINUTES) {
      const slotValue = minutesToTimeStr(slotStart)
      const slotBlockEnd = slotStart + AVAILABILITY_STEP_MINUTES
      const requestedEnd = slotStart + requestedDurationMinutes
      let isBooked = false
      let overlapsRequestedWindow = false

      for (const range of bookedRanges) {
        const bookedStart = timeToMinutes(range.start)
        const bookedEnd = timeToMinutes(range.end)
        if (bookedStart === null || bookedEnd === null) continue

        // Mark true booked windows and starts that cannot fit selected duration.
        if (rangesOverlap(slotStart, slotBlockEnd, bookedStart, bookedEnd)) {
          isBooked = true
        }
        if (rangesOverlap(slotStart, requestedEnd, bookedStart, bookedEnd)) {
          overlapsRequestedWindow = true
        }
        if (isBooked && overlapsRequestedWindow) break
      }

      statusMap[slotValue] = {
        status: isBooked ? 'booked' : overlapsRequestedWindow ? 'unavailable' : 'available'
      }
    }

    return statusMap
  }, [bookedRanges, form.date, requestedDurationMinutes])

  useEffect(() => {
    if (!form.startTime) return
    if (!form.date) {
      setForm((prev) => ({ ...prev, startTime: '' }))
      return
    }

    const selectedStatus = slotStatusByValue[form.startTime]?.status
    if (selectedStatus && selectedStatus !== 'available') {
      setForm((prev) => ({ ...prev, startTime: '' }))
    }
  }, [form.date, form.startTime, slotStatusByValue])

  useEffect(() => {
    if (!form.date) {
      setExistingBookings([])
      setLoadingAvailability(false)
      return
    }

    let cancelled = false
    setLoadingAvailability(true)

    async function fetchBookings() {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, time_slot, duration, status, hold_expires_at')
        .eq('booking_date', form.date)

      if (cancelled) return
      if (error) {
        console.error('Error fetching bookings:', error)
        setExistingBookings([])
      } else {
        setExistingBookings(data || [])
      }
      setLoadingAvailability(false)
    }

    fetchBookings()
    return () => { cancelled = true }
  }, [form.date])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()

    const hours = Number(form.hours || 0)
    if (hours < MIN_HOURS) {
      alert(`Minimum booking duration is ${MIN_HOURS} hours.`)
      return
    }

    if (overlapConflict) {
      alert(`This time slot overlaps with an existing booking (${overlapConflict.existingStart} – ${overlapConflict.existingEnd}). Please choose a different time.`)
      return
    }

    setSubmitting(true)
    try {
      const checkoutReady = await loadRazorpayCheckoutScript()
      if (!checkoutReady || !window.Razorpay) {
        setSubmitting(false)
        alert('Unable to load Razorpay checkout. Please try again.')
        return
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          booking: {
            ...form,
            hours,
            guests: Number(form.guests || 0)
          }
        }
      })

      if (orderError || !orderData?.ok) {
        setSubmitting(false)
        if (orderError) console.error('Create Razorpay order error:', orderError)
        alert(orderData?.error || 'Unable to initialize payment. Please try again.')
        return
      }

      let paymentVerified = false

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: orderData.checkoutName || 'The Zone',
        description: orderData.checkoutDescription || 'Booking Payment',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        notes: {
          booking_id: orderData.bookingId
        },
        theme: {
          color: '#F59E0B'
        },
        handler: async (paymentResponse) => {
          const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              bookingId: orderData.bookingId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            }
          })

          if (verificationError || !verificationData?.ok) {
            await supabase.functions.invoke('record-razorpay-failure', {
              body: {
                bookingId: orderData.bookingId,
                reason: verificationData?.error || 'Payment verification failed.',
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id
              }
            })
            setSubmitting(false)
            alert(verificationData?.error || 'Payment verification failed. Please contact support.')
            return
          }

          paymentVerified = true

          const eventTypeLabel =
            EVENT_TYPES.find((t) => t.value === form.eventType)?.label || form.eventType

          // Fire-and-forget email send; booking remains confirmed even if email fails.
          supabase.functions
            .invoke('send-booking-confirmation', {
              body: {
                bookingId: orderData.bookingId,
                name: form.name,
                email: form.email,
                phone: form.phone || null,
                eventType: eventTypeLabel,
                date: form.date,
                startTime: form.startTime,
                endTime: estimatedEndTime || null,
                durationHours: hours,
                guests: Number(form.guests || 0),
                addOns: [],
                estimatedTotal: Math.round(estimatedTotal),
                notes: form.notes?.trim() || null
              }
            })
            .then(({ data, error: fnError }) => {
              if (fnError) {
                console.warn('Confirmation email failed:', fnError)
                return
              }
              if (data && data.ok === false) {
                console.warn('Confirmation email rejected:', data)
              }
            })
            .catch((err) => {
              console.warn('Confirmation email invoke error:', err)
            })

          setSubmitted({
            ...form,
            estimatedTotal,
            estimatedEndTime,
            bookingId: orderData.bookingId,
            razorpayPaymentId: paymentResponse.razorpay_payment_id
          })
          setSubmitting(false)
        },
        modal: {
          ondismiss: async () => {
            if (paymentVerified) return

            await supabase.functions.invoke('record-razorpay-failure', {
              body: {
                bookingId: orderData.bookingId,
                reason: 'Checkout closed before payment completion.',
                razorpay_order_id: orderData.razorpayOrderId
              }
            })

            setSubmitting(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', async (response) => {
        const errorDetails = response?.error || {}
        await supabase.functions.invoke('record-razorpay-failure', {
          body: {
            bookingId: orderData.bookingId,
            reason: errorDetails.description || 'Payment failed.',
            code: errorDetails.code || null,
            razorpay_order_id: errorDetails?.metadata?.order_id || orderData.razorpayOrderId,
            razorpay_payment_id: errorDetails?.metadata?.payment_id || null
          }
        })

        setSubmitting(false)
        alert(errorDetails.description || 'Payment failed. Please try again.')
      })

      razorpay.open()
    } catch (error) {
      setSubmitting(false)
      console.error('Booking payment flow error:', error)
      alert('Failed to start payment. Please try again.')
    }
  }

  function resetForm() {
    setSubmitted(null)
    setForm((prev) => ({
      ...prev,
      date: '',
      startTime: '',
      hours: '3',
      guests: '10',
      otherEventPurpose: '',
      name: '',
      email: '',
      phone: '',
      notes: ''
    }))
  }

  // Hero animations
  const heroBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const heroTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const heroSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  
  // Form section animations
  const formRef = useGSAPScroll({ animation: 'fadeInLeft', delay: 0.2, duration: 0.8, start: 'top 85%' })
  const summaryRef = useGSAPScroll({ animation: 'fadeInRight', delay: 0.3, duration: 0.8, start: 'top 85%' })

  return (
    <div className="bookNowPage">
      <Navbar />

      {/* Hero */}
      <section className="bookHero">
        <div className="heroBackground" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="heroOverlay" />
        </div>
        <div className="container">
          <span ref={heroBadgeRef} className="badge">Book Now</span>
          <h1 ref={heroTitleRef} className="bookTitle">
            Reserve Your
            <span className="accent"> Perfect Event</span>
          </h1>
          <p ref={heroSubtitleRef} className="bookSubtitle">
            Fill out the form, submit, and complete secure payment to confirm your slot instantly.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section bookingSection">
        <div className="container">
          <div className="bookingGrid">
            {/* Form */}
            <div ref={formRef} className="bookingForm">
              {submitted ? (
                <div className="bookingSuccess">
                  <div className="successIcon">✓</div>
                  <h2>Payment Successful! Booking Confirmed.</h2>
                  <p>Your slot is now locked. You will receive confirmation details shortly.</p>
                  
                  <div className="successDetails">
                    <div className="successRow">
                      <span className="successLabel">Date</span>
                      <span className="successValue">{submitted.date}</span>
                    </div>
                    <div className="successRow">
                      <span className="successLabel">Time</span>
                      <span className="successValue">
                        {format12Hour(submitted.startTime)} – {format12Hour(submitted.estimatedEndTime)}
                      </span>
                    </div>
                    <div className="successRow">
                      <span className="successLabel">Duration</span>
                      <span className="successValue">{submitted.hours} hours</span>
                    </div>
                    <div className="successRow">
                      <span className="successLabel">Guests</span>
                      <span className="successValue">{submitted.guests}</span>
                    </div>
                    <div className="successRow total">
                      <span className="successLabel">Estimated Total</span>
                      <span className="successValue">{money.format(submitted.estimatedTotal)}</span>
                    </div>
                    <div className="successRow">
                      <span className="successLabel">Payment ID</span>
                      <span className="successValue">{submitted.razorpayPaymentId || '—'}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={resetForm}>
                    Book Another Event
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  {/* Event Details */}
                  <div className="formSection">
                    <h3 className="formSectionTitle">Event Details</h3>
                    
                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="eventType">Event Type</label>
                        <select
                          id="eventType"
                          value={form.eventType}
                          onChange={(e) => {
                            updateField('eventType', e.target.value)
                            if (e.target.value !== 'other') updateField('otherEventPurpose', '')
                          }}
                          required
                        >
                          {EVENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="formGroup">
                        <label htmlFor="guests">Number of Guests</label>
                        <input
                          id="guests"
                          type="number"
                          min="1"
                          max="40"
                          value={form.guests}
                          onChange={(e) => updateField('guests', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {form.eventType === 'other' && (
                      <div className="formGroup">
                        <label htmlFor="otherEventPurpose">What is the event for?</label>
                        <textarea
                          id="otherEventPurpose"
                          rows={2}
                          placeholder="e.g., Birthday party, baby shower, photoshoot..."
                          value={form.otherEventPurpose}
                          onChange={(e) => updateField('otherEventPurpose', e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="formSection">
                    <h3 className="formSectionTitle">Date & Time</h3>
                    
                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="date">Date</label>
                        <MaterialDatePicker
                          id="date"
                          value={form.date}
                          minDate={today}
                          onChange={(nextDate) => updateField('date', nextDate)}
                          required
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="startTime">Start Time</label>
                        <TimePicker
                          id="startTime"
                          value={form.startTime}
                          onChange={(v) => updateField('startTime', v)}
                          variant="booking"
                          minuteStep={1}
                          disabled={!form.date || loadingAvailability}
                          placeholder={
                            !form.date
                              ? 'Select date first'
                              : loadingAvailability
                                ? 'Checking slots...'
                                : 'Choose a start time'
                          }
                          slotStatusByValue={form.date ? slotStatusByValue : null}
                          required
                        />
                      </div>
                    </div>

                    <div className="formGroup">
                      <label htmlFor="hours">Duration (hours)</label>
                      <input
                        id="hours"
                        type="number"
                        min={MIN_HOURS}
                        max={MAX_HOURS}
                        step="0.5"
                        value={form.hours}
                        onChange={(e) => updateField('hours', e.target.value)}
                        required
                      />
                      <span className="formHelp">Minimum {MIN_HOURS} hours. Base rate includes {MIN_HOURS} hours.</span>
                    </div>

                    {/* Mobile Estimated Total */}
                    <div className="mobileEstimatedTotal">
                      <span className="mobileTotalLabel">Estimated Total</span>
                      <span className="mobileTotalValue">{money.format(estimatedTotal)}</span>
                    </div>

                    {estimatedEndTime && (
                      <div className="timePreview">
                        <span>📅</span>
                        {format12Hour(form.startTime)} – {format12Hour(estimatedEndTime)}
                        {loadingAvailability && <span className="checking"> • Checking availability...</span>}
                      </div>
                    )}

                    {form.date && !loadingAvailability && bookedRanges.length > 0 && (
                      <div className="bookedSlotsSummary">
                        <span className="bookedSlotsLabel">Booked on this date:</span>
                        <span className="bookedSlotsList">
                          {bookedRanges
                            .map((range) => `${format12Hour(range.start)} – ${format12Hour(range.end)}`)
                            .join(' • ')}
                        </span>
                      </div>
                    )}

                    {overlapConflict && (
                      <div className="conflictAlert">
                        ⚠️ This time conflicts with an existing booking ({overlapConflict.existingStart} – {overlapConflict.existingEnd}). Please choose a different time.
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="formSection">
                    <h3 className="formSectionTitle">Your Information</h3>
                    
                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="name">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="phone">Phone</label>
                        <input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="formGroup">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="formGroup">
                      <label htmlFor="notes">Special Requests (Optional)</label>
                      <textarea
                        id="notes"
                        rows={3}
                        placeholder="Any setup requirements, accessibility needs, or special requests..."
                        value={form.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="formActions">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={submitting || !!overlapConflict}
                    >
                      {submitting ? 'Processing Payment...' : 'Pay & Confirm Booking'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={resetForm}
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="bookingSidebar">
              <div ref={summaryRef} className="summaryCard">
                <h3>Booking Summary</h3>
                
                <div className="summaryRows">
                  <div className="summaryRow">
                    <span>Event Type</span>
                    <span>{EVENT_TYPES.find(t => t.value === form.eventType)?.label || '—'}</span>
                  </div>
                  <div className="summaryRow">
                    <span>Date</span>
                    <span>{form.date || '—'}</span>
                  </div>
                  <div className="summaryRow">
                    <span>Time</span>
                    <span>
                      {form.startTime ? format12Hour(form.startTime) : '—'}
                      {estimatedEndTime && ` – ${format12Hour(estimatedEndTime)}`}
                    </span>
                  </div>
                  <div className="summaryRow">
                    <span>Duration</span>
                    <span>{form.hours} hours</span>
                  </div>
                  <div className="summaryRow">
                    <span>Guests</span>
                    <span>{form.guests}</span>
                  </div>
                </div>

                <div className="summaryDivider" />

                <div className="summaryRows">
                  <div className="summaryRow">
                    <span>Day Type</span>
                    <span>{pricing.dayType || '—'}</span>
                  </div>
                  <div className="summaryRow">
                    <span>Base ({MIN_HOURS}hrs)</span>
                    <span>{money.format(pricing.base)}</span>
                  </div>
                  {Number(form.hours) > MIN_HOURS && (
                    <div className="summaryRow">
                      <span>Additional ({Number(form.hours) - MIN_HOURS}hrs × {money.format(pricing.additionalPerHour)})</span>
                      <span>+{money.format((Number(form.hours) - MIN_HOURS) * pricing.additionalPerHour)}</span>
                    </div>
                  )}
                </div>

                <div className="summaryDivider" />

                <div className="summaryTotal">
                  <span>Estimated Total</span>
                  <span>{money.format(estimatedTotal)}</span>
                </div>

                <p className="summaryNote">
                  Full payment is collected at checkout to confirm and lock your booking slot.
                </p>
              </div>

              <div className="helpCard">
                <h4>Need Help?</h4>
                <p>Questions about your booking? We're here to help.</p>
                <a href="#/contact" className="btn btn-outline btn-sm">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
