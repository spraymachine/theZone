import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import TimePicker from './components/TimePicker'

const EVENT_TYPES = [
  { value: 'office', label: 'Private office' },
  { value: 'party', label: 'Party' },
  { value: 'get_together', label: 'Get-together' },
  { value: 'conference', label: 'Conference' },
  { value: 'other', label: 'Other' }
]

const ADD_ONS = [
  { key: 'cleaning', label: 'Cleaning', fee: 40 },
  { key: 'projector', label: 'Projector', fee: 25 },
  { key: 'sound', label: 'Sound system', fee: 30 },
  { key: 'catering', label: 'Catering setup', fee: 50 }
]

const MIN_HOURS = 2
const MAX_HOURS = 24

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })

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

// Check if two time ranges overlap
// Range A: startA to endA, Range B: startB to endB (all in minutes from midnight)
function rangesOverlap(startA, endA, startB, endB) {
  // Handle overnight ranges by normalizing
  if (endA <= startA) endA += 24 * 60
  if (endB <= startB) endB += 24 * 60
  return startA < endB && startB < endA
}

export default function App() {
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
    hours: '2',
    guests: '10',
    hourlyRate: '95',
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

  const baseTotal = useMemo(() => Number(form.hours || 0) * Number(form.hourlyRate || 0), [form.hours, form.hourlyRate])

  const estimatedTotal = useMemo(() => baseTotal + addOnTotal, [baseTotal, addOnTotal])

  const estimatedEndTime = useMemo(() => {
    const minutes = Math.round(Number(form.hours || 0) * 60)
    if (!minutes) return null
    return addMinutesToTimeStr(form.startTime, minutes)
  }, [form.startTime, form.hours])

  // Check for overlapping bookings
  const overlapConflict = useMemo(() => {
    if (!form.date || !form.startTime || !form.hours) return null

    const newStart = timeToMinutes(form.startTime)
    if (newStart === null) return null
    const newEnd = newStart + Number(form.hours) * 60

    for (const booking of existingBookings) {
      if (booking.status === 'cancelled') continue
      
      const existingStart = timeToMinutes(booking.time_slot)
      if (existingStart === null) continue
      
      // Default to 2 hours if duration not stored
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

  // Fetch existing bookings for selected date
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
        console.error('Error fetching bookings for date:', error)
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

 
  //--------------------------------------------------------------------------  
  async function onSubmit(e) {
    e.preventDefault()
  
    // Validate minimum duration
    const hours = Number(form.hours || 0)
    if (hours < MIN_HOURS) {
      alert(`Minimum booking duration is ${MIN_HOURS} hours.`)
      return
    }

    // Check for overlaps
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
      duration: hours, // Store duration for overlap checks
  
      guests: Number(form.guests || 0),
      notes: mergedNotes,
      amount: Math.round(estimatedTotal),
      status: 'pending'
    }
  
    console.log('Submitting to Supabase:', bookingPayload)
  
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
  
    // success
    setSubmitted({
      ...form,
      estimatedTotal,
      estimatedEndTime
    })
  
    alert('Reservation request submitted!')
  }
//--------------------------------------------------------------------------    

  return (
    <div className="app">
      <header className="header">
        <div className="badgeRow">
        <div className="badge">The Zone • Private space rentals</div>
          <a className="adminNavLink" href="#/admin">
            Admin dashboard
          </a>
        </div>
        <h1>The Zone</h1>
        <p className="subtle">Book a private space for office time, parties, get-togethers, and conferences. Charged hourly.</p>
      </header>

      <main className="card">
        <div className="cardHeader">
          <div>
            <h2>Reservation request</h2>
            <p className="subtle">Fill this out and we'll follow up to confirm availability.</p>
          </div>
          <div className="estimate" aria-live="polite">
            <div className="estimateLabel">Estimated total</div>
            <div className="estimateValue">{money.format(estimatedTotal)}</div>
            <div className="estimateHint">
              {Number(form.hours) > 0 ? (
                <>
                  {money.format(form.hourlyRate)}/hr × {Number(form.hours)}h
                  {addOnTotal ? ` + ${money.format(addOnTotal)} add-ons` : ''}
                </>
              ) : (
                'Enter hours to estimate'
              )}
            </div>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="grid2">
            <div className="field">
              <label htmlFor="eventType">Event type</label>
              <select
                id="eventType"
                value={form.eventType}
                onChange={(e) => {
                  const next = e.target.value
                  updateField('eventType', next)
                  if (next !== 'other') updateField('otherEventPurpose', '')
                }}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {form.eventType === 'other' ? (
              <div className="field fieldSpan2">
                <label htmlFor="otherEventPurpose">What is the event for?</label>
                <textarea
                  id="otherEventPurpose"
                  rows={3}
                  placeholder="Tell us what you're planning (e.g., birthday party, baby shower, photoshoot, etc.)"
                  value={form.otherEventPurpose}
                  onChange={(e) => updateField('otherEventPurpose', e.target.value)}
                  required
                />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="guests">Guests</label>
              <input
                id="guests"
                type="number"
                min="1"
                step="1"
                value={form.guests}
                onChange={(e) => updateField('guests', e.target.value)}
                required
              />
            </div>

            <div className="field">
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

            <div className="field">
              <label htmlFor="startTime">Start time</label>
              <TimePicker
                id="startTime"
                value={form.startTime}
                onChange={(v) => updateField('startTime', v)}
                required
              />
              {estimatedEndTime ? (
                <div className="help">
                  Ends at {format12Hour(estimatedEndTime)}
                  {loadingAvailability ? ' • Checking availability…' : ''}
                </div>
              ) : null}
              {overlapConflict && (
                <div className="helpError">
                  Conflicts with booking {overlapConflict.existingStart} – {overlapConflict.existingEnd}
                </div>
              )}
            </div>

            <div className="field">
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
              <div className="help">Minimum {MIN_HOURS} hours</div>
            </div>

            <div className="field">
              <label htmlFor="hourlyRate">Hourly rate (USD)</label>
              <input
                id="hourlyRate"
                type="number"
                min="0"
                step="1"
                value={form.hourlyRate}
                onChange={(e) => updateField('hourlyRate', e.target.value)}
                required
              />
              <div className="help">Adjust this if you have a custom quote.</div>
            </div>
          </div>

          <fieldset className="fieldset">
            <legend>Add-ons</legend>
            <div className="checks">
              {ADD_ONS.map((a) => (
                <label key={a.key} className="check">
                  <input
                    type="checkbox"
                    checked={!!form.addOns[a.key]}
                    onChange={() => toggleAddOn(a.key)}
                  />
                  <span>
                    {a.label} <span className="pill">{money.format(a.fee)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="divider" />

          <div className="grid2">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="field">
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

            <div className="field">
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

            <div className="field fieldSpan2">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Anything we should know? Setup needs, schedule, special requests…"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="actions">
            <button 
              className="primary" 
              type="submit" 
              disabled={submitting || !!overlapConflict}
            >
              {submitting ? 'Submitting…' : 'Request reservation'}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={submitting}
              onClick={() => {
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
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {submitted ? (
          <section className="success" aria-live="polite">
            <h3>Request saved (demo)</h3>
            <p className="subtle">
              This is a front-end-only form right now. Your request payload is logged to the console.
            </p>
            <div className="successGrid">
              <div>
                <div className="k">When</div>
                <div className="v">
                  {submitted.date} • {format12Hour(submitted.startTime)}
                  {submitted.estimatedEndTime ? ` – ${format12Hour(submitted.estimatedEndTime)}` : ''}
                </div>
              </div>
              <div>
                <div className="k">Duration</div>
                <div className="v">{submitted.hours} hours</div>
              </div>
              <div>
                <div className="k">Guests</div>
                <div className="v">{submitted.guests}</div>
              </div>
              <div>
                <div className="k">Estimate</div>
                <div className="v">{money.format(submitted.estimatedTotal)}</div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="footer">
        <span className="subtle">Tip: hook this up to an email/CRM endpoint when you're ready.</span>
      </footer>
    </div>
  )
}
