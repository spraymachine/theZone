import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TimePicker from '../components/TimePicker'
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

const ADD_ONS = [
  { key: 'cleaning', label: 'Deep Cleaning', fee: 400, icon: '🧹' },
  { key: 'projector', label: 'Extra Projector', fee: 250, icon: '📽️' },
  { key: 'sound', label: 'Sound Upgrade', fee: 300, icon: '🔊' },
  { key: 'catering', label: 'Catering Setup', fee: 500, icon: '🍽️' }
]

const MIN_HOURS = 3
const MAX_HOURS = 24

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
    addOns: {
      cleaning: false,
      projector: false,
      sound: false,
      catering: false
    },
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  const addOnTotal = useMemo(() => {
    return ADD_ONS.reduce((sum, a) => sum + (form.addOns[a.key] ? a.fee : 0), 0)
  }, [form.addOns])

  // Calculate pricing based on weekday/weekend
  const pricing = useMemo(() => {
    if (!form.date) {
      return { base: 0, additionalPerHour: 0, dayType: '' }
    }
    const date = new Date(form.date)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday - Thursday
      return { base: 3499, additionalPerHour: 1000, dayType: 'Weekday' }
    } else { // Friday - Sunday
      return { base: 4499, additionalPerHour: 1299, dayType: 'Weekend' }
    }
  }, [form.date])

  const baseTotal = useMemo(() => {
    const hours = Number(form.hours || 0)
    if (hours <= MIN_HOURS) return pricing.base
    const additionalHours = hours - MIN_HOURS
    return pricing.base + additionalHours * pricing.additionalPerHour
  }, [form.hours, pricing])

  const estimatedTotal = useMemo(() => baseTotal + addOnTotal, [baseTotal, addOnTotal])

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
      if (booking.status === 'cancelled') continue
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

  useEffect(() => {
    if (!form.date) {
      setExistingBookings([])
      return
    }

    let cancelled = false
    setLoadingAvailability(true)

    async function fetchBookings() {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, time_slot, duration, status')
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

  function toggleAddOn(key) {
    setForm((prev) => ({ ...prev, addOns: { ...prev.addOns, [key]: !prev.addOns[key] } }))
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

    const mergedNotes =
      form.eventType === 'other' && form.otherEventPurpose.trim()
        ? `Other event purpose: ${form.otherEventPurpose.trim()}${form.notes.trim() ? `\n\nNotes: ${form.notes.trim()}` : ''}`
        : (form.notes.trim() ? form.notes.trim() : null)

    const bookingPayload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      event_type: form.eventType,
      booking_date: form.date,
      time_slot: form.startTime,
      duration: hours,
      guests: Number(form.guests || 0),
      notes: mergedNotes,
      amount: Math.round(estimatedTotal),
      status: 'pending'
    }

    const { error } = await supabase
      .from('bookings')
      .insert([bookingPayload])

    setSubmitting(false)

    if (error) {
      console.error('Supabase error:', error)
      if (error.code === '23505') {
        alert('This time slot is already booked. Please choose another.')
      } else {
        alert('Failed to submit reservation. Please try again.')
      }
      return
    }

    setSubmitted({
      ...form,
      estimatedTotal,
      estimatedEndTime
    })
  }

  function resetForm() {
    setSubmitted(null)
    setForm((prev) => ({
      ...prev,
      date: '',
      startTime: '',
      hours: '2',
      guests: '10',
      addOns: { cleaning: false, projector: false, sound: false, catering: false },
      otherEventPurpose: '',
      name: '',
      email: '',
      phone: '',
      notes: ''
    }))
  }

  return (
    <div className="bookNowPage">
      <Navbar />

      {/* Hero */}
      <section className="bookHero">
        <div className="heroBackground" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="heroOverlay" />
        </div>
        <div className="container">
          <span className="badge">Book Now</span>
          <h1 className="bookTitle">
            Reserve Your
            <span className="accent"> Perfect Event</span>
          </h1>
          <p className="bookSubtitle">
            Fill out the form below and we'll confirm your booking within 24 hours.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section bookingSection">
        <div className="container">
          <div className="bookingGrid">
            {/* Form */}
            <div className="bookingForm">
              {submitted ? (
                <div className="bookingSuccess">
                  <div className="successIcon">✓</div>
                  <h2>Booking Request Submitted!</h2>
                  <p>We'll review your request and get back to you within 24 hours.</p>
                  
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
                        <input
                          id="date"
                          type="date"
                          min={today}
                          value={form.date}
                          onChange={(e) => updateField('date', e.target.value)}
                          required
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="startTime">Start Time</label>
                        <TimePicker
                          id="startTime"
                          value={form.startTime}
                          onChange={(v) => updateField('startTime', v)}
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

                    {estimatedEndTime && (
                      <div className="timePreview">
                        <span>📅</span>
                        {format12Hour(form.startTime)} – {format12Hour(estimatedEndTime)}
                        {loadingAvailability && <span className="checking"> • Checking availability...</span>}
                      </div>
                    )}

                    {overlapConflict && (
                      <div className="conflictAlert">
                        ⚠️ This time conflicts with an existing booking ({overlapConflict.existingStart} – {overlapConflict.existingEnd}). Please choose a different time.
                      </div>
                    )}
                  </div>

                  {/* Add-ons */}
                  <div className="formSection">
                    <h3 className="formSectionTitle">Add-ons (Optional)</h3>
                    <div className="addOnsGrid">
                      {ADD_ONS.map((addon) => (
                        <label 
                          key={addon.key} 
                          className={`addOnCard ${form.addOns[addon.key] ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.addOns[addon.key]}
                            onChange={() => toggleAddOn(addon.key)}
                          />
                          <span className="addOnIcon">{addon.icon}</span>
                          <span className="addOnLabel">{addon.label}</span>
                          <span className="addOnPrice">{money.format(addon.fee)}</span>
                        </label>
                      ))}
                    </div>
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
                      {submitting ? 'Submitting...' : 'Submit Booking Request'}
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
              <div className="summaryCard">
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
                  {addOnTotal > 0 && (
                    <div className="summaryRow">
                      <span>Add-ons</span>
                      <span>+{money.format(addOnTotal)}</span>
                    </div>
                  )}
                </div>

                <div className="summaryDivider" />

                <div className="summaryTotal">
                  <span>Estimated Total</span>
                  <span>{money.format(estimatedTotal)}</span>
                </div>

                <p className="summaryNote">
                  50% deposit required to confirm. Final amount may vary based on actual duration.
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


