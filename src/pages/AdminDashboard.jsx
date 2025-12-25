import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import TimePicker from '../components/TimePicker'
import './AdminDashboard.css'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

const MIN_HOURS = 3
const MAX_HOURS = 24

// Calculate pricing based on weekday/weekend
function calculatePricing(date, duration) {
  if (!date) {
    return { base: 0, additionalPerHour: 0, total: 0, dayType: '' }
  }
  const d = new Date(date)
  const dayOfWeek = d.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = Number(duration || MIN_HOURS)

  let base, additionalPerHour, dayType
  if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday - Thursday
    base = 3499
    additionalPerHour = 1000
    dayType = 'Weekday'
  } else { // Friday - Sunday
    base = 4499
    additionalPerHour = 1299
    dayType = 'Weekend'
  }

  const total = hours <= MIN_HOURS ? base : base + (hours - MIN_HOURS) * additionalPerHour
  return { base, additionalPerHour, total, dayType }
}

const DEFAULT_CREATE = {
  name: '',
  email: '',
  phone: '',
  booking_date: '',
  time_slot: '',
  duration: '3',
  guests: '10',
  amount: '0',
  status: 'pending',
  notes: ''
}

function normalizeBooking(row) {
  return {
    ...row,
    guests: row?.guests ?? 0,
    amount: row?.amount ?? 0,
    duration: row?.duration ?? 3,
    notes: row?.notes ?? ''
  }
}

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

export default function AdminDashboard({ onSignOut }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({ q: '', date: '', status: 'all' })
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE)
  const [selected, setSelected] = useState(null)
  const [editForm, setEditForm] = useState(null)

  // Auto-calculate amount for create form
  useEffect(() => {
    if (createForm.booking_date && createForm.duration) {
      const pricing = calculatePricing(createForm.booking_date, createForm.duration)
      setCreateForm(prev => ({ ...prev, amount: String(pricing.total) }))
    }
  }, [createForm.booking_date, createForm.duration])

  // Auto-calculate amount for edit form
  useEffect(() => {
    if (editForm?.booking_date && editForm?.duration) {
      const pricing = calculatePricing(editForm.booking_date, editForm.duration)
      setEditForm(prev => prev ? { ...prev, amount: String(pricing.total) } : null)
    }
  }, [editForm?.booking_date, editForm?.duration])

  async function loadBookings() {
    setLoading(true)
    setError('')
    const { data, error: e } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false })
      .order('time_slot', { ascending: true })

    if (e) {
      setError(e.message || 'Failed to load bookings.')
      setLoading(false)
      return
    }
    setBookings((data || []).map(normalizeBooking))
    setLoading(false)
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = (filters.q || '').trim().toLowerCase()
    return bookings.filter((b) => {
      if (filters.date && b.booking_date !== filters.date) return false
      if (filters.status !== 'all' && (b.status || '').toLowerCase() !== filters.status) return false
      if (!q) return true
      const hay = [
        b.name,
        b.email,
        b.phone,
        b.booking_date,
        b.time_slot,
        b.status,
        b.notes
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [bookings, filters])

  // Check for overlap when creating
  const createOverlap = useMemo(() => {
    if (!createForm.booking_date || !createForm.time_slot || !createForm.duration) return null
    const newStart = timeToMinutes(createForm.time_slot)
    if (newStart === null) return null
    const newEnd = newStart + Number(createForm.duration) * 60

    for (const booking of bookings) {
      if (booking.status === 'cancelled') continue
      if (booking.booking_date !== createForm.booking_date) continue
      
      const existingStart = timeToMinutes(booking.time_slot)
      if (existingStart === null) continue
      const existingDuration = booking.duration || 2
      const existingEnd = existingStart + existingDuration * 60

      if (rangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
        return {
          start: format12Hour(booking.time_slot),
          end: format12Hour(addMinutesToTimeStr(booking.time_slot, existingDuration * 60))
        }
      }
    }
    return null
  }, [createForm.booking_date, createForm.time_slot, createForm.duration, bookings])

  // Check for overlap when editing
  const editOverlap = useMemo(() => {
    if (!editForm || !editForm.booking_date || !editForm.time_slot || !editForm.duration) return null
    const newStart = timeToMinutes(editForm.time_slot)
    if (newStart === null) return null
    const newEnd = newStart + Number(editForm.duration) * 60

    for (const booking of bookings) {
      if (booking.status === 'cancelled') continue
      if (booking.booking_date !== editForm.booking_date) continue
      // Skip the booking we're editing
      if (editForm.id != null && booking.id === editForm.id) continue
      
      const existingStart = timeToMinutes(booking.time_slot)
      if (existingStart === null) continue
      const existingDuration = booking.duration || 2
      const existingEnd = existingStart + existingDuration * 60

      if (rangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
        return {
          start: format12Hour(booking.time_slot),
          end: format12Hour(addMinutesToTimeStr(booking.time_slot, existingDuration * 60))
        }
      }
    }
    return null
  }, [editForm, bookings])

  function selectBooking(b) {
    setSelected(b)
    setEditForm({
      id: b?.id,
      name: b?.name || '',
      email: b?.email || '',
      phone: b?.phone || '',
      booking_date: b?.booking_date || '',
      time_slot: b?.time_slot || '',
      duration: b?.duration == null ? '3' : String(b.duration),
      guests: b?.guests == null ? '' : String(b.guests),
      amount: b?.amount == null ? '' : String(b.amount),
      status: b?.status || 'pending',
      notes: b?.notes || ''
    })
  }

  async function createBooking(e) {
    e.preventDefault()

    if (createOverlap) {
      setError(`Conflicts with existing booking (${createOverlap.start} – ${createOverlap.end}). Choose a different time.`)
      return
    }

    setSaving(true)
    setError('')

    const hours = Number(createForm.duration || MIN_HOURS)
    if (hours < MIN_HOURS) {
      setError(`Minimum booking duration is ${MIN_HOURS} hours.`)
      setSaving(false)
      return
    }

    const pricing = calculatePricing(createForm.booking_date, createForm.duration)
    const payload = {
      name: createForm.name,
      email: createForm.email,
      phone: createForm.phone,
      booking_date: createForm.booking_date,
      time_slot: createForm.time_slot,
      duration: hours,
      guests: Number(createForm.guests || 0),
      amount: Math.round(pricing.total),
      status: createForm.status || 'pending',
      notes: createForm.notes || null
    }

    const { data, error: e2 } = await supabase.from('bookings').insert([payload]).select('*').single()
    if (e2) {
      if (e2.code === '23505') {
        setError('This time slot is already booked (unique date + time).')
      } else {
        setError(e2.message || 'Failed to create booking.')
      }
      setSaving(false)
      return
    }

    setBookings((prev) => [normalizeBooking(data), ...prev])
    setCreateForm(DEFAULT_CREATE)
    setSaving(false)
  }

  async function saveEdits(e) {
    e.preventDefault()
    if (!editForm) return

    if (editOverlap) {
      setError(`Conflicts with existing booking (${editOverlap.start} – ${editOverlap.end}). Choose a different time.`)
      return
    }

    setSaving(true)
    setError('')

    const hours = Number(editForm.duration || MIN_HOURS)
    if (hours < MIN_HOURS) {
      setError(`Minimum booking duration is ${MIN_HOURS} hours.`)
      setSaving(false)
      return
    }

    const pricing = calculatePricing(editForm.booking_date, editForm.duration)
    const patch = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      booking_date: editForm.booking_date,
      time_slot: editForm.time_slot,
      duration: hours,
      guests: Number(editForm.guests || 0),
      amount: Math.round(pricing.total),
      status: editForm.status || 'pending',
      notes: editForm.notes || null
    }

    let q = supabase.from('bookings').update(patch)
    if (editForm.id != null) {
      q = q.eq('id', editForm.id)
    } else {
      q = q.match({ booking_date: selected.booking_date, time_slot: selected.time_slot, email: selected.email })
    }
    const { data, error: e3 } = await q.select('*').single()

    if (e3) {
      if (e3.code === '23505') {
        setError('Update would conflict with an existing booking for that date + time.')
      } else {
        setError(e3.message || 'Failed to update booking.')
      }
      setSaving(false)
      return
    }

    const updated = normalizeBooking(data)
    setBookings((prev) => prev.map((b) => ((updated.id != null && b.id === updated.id) ? updated : b.booking_date === selected.booking_date && b.time_slot === selected.time_slot && b.email === selected.email ? updated : b)))
    setSelected(updated)
    setEditForm({
      id: updated.id,
      name: updated.name || '',
      email: updated.email || '',
      phone: updated.phone || '',
      booking_date: updated.booking_date || '',
      time_slot: updated.time_slot || '',
      duration: updated.duration == null ? '2' : String(updated.duration),
      guests: updated?.guests == null ? '' : String(updated.guests),
      amount: updated?.amount == null ? '' : String(updated.amount),
      status: updated.status || 'pending',
      notes: updated.notes || ''
    })
    setSaving(false)
  }

  async function cancelBooking() {
    if (!selected) return
    const ok = window.confirm('Cancel this booking? This will set status to "cancelled".')
    if (!ok) return

    setSaving(true)
    setError('')

    let q = supabase.from('bookings').update({ status: 'cancelled' })
    if (selected.id != null) {
      q = q.eq('id', selected.id)
    } else {
      q = q.match({ booking_date: selected.booking_date, time_slot: selected.time_slot, email: selected.email })
    }

    const { data, error: e } = await q.select('*').single()
    if (e) {
      setError(e.message || 'Failed to cancel booking.')
      setSaving(false)
      return
    }

    const updated = normalizeBooking(data)
    setBookings((prev) => prev.map((b) => ((updated.id != null && b.id === updated.id) ? updated : b.booking_date === selected.booking_date && b.time_slot === selected.time_slot && b.email === selected.email ? updated : b)))
    setSelected(updated)
    setEditForm((prev) => (prev ? { ...prev, status: updated.status } : prev))
    setSaving(false)
  }

  async function deleteBookingPermanently() {
    if (!selected) return
    const ok = window.confirm('Permanently delete this booking? This cannot be undone.')
    if (!ok) return

    setSaving(true)
    setError('')

    let q = supabase.from('bookings').delete()
    if (selected.id != null) {
      q = q.eq('id', selected.id)
    } else {
      q = q.match({ booking_date: selected.booking_date, time_slot: selected.time_slot, email: selected.email })
    }

    const { error: e } = await q
    if (e) {
      setError(e.message || 'Failed to delete booking.')
      setSaving(false)
      return
    }

    setBookings((prev) =>
      prev.filter((b) =>
        selected.id != null && b.id != null
          ? b.id !== selected.id
          : !(b.booking_date === selected.booking_date && b.time_slot === selected.time_slot && b.email === selected.email)
      )
    )
    setSelected(null)
    setEditForm(null)
    setSaving(false)
  }

  return (
    <div className="admin">
      <header className="adminHeader">
        <div className="adminHeaderLeft">
          <div className="adminBadge">Admin • Bookings</div>
          <h1 className="adminTitle">Dashboard</h1>
          <p className="adminSubtle">View, add, update, and cancel bookings stored in Supabase.</p>
        </div>
        <div className="adminHeaderRight">
          <a className="adminLink" href="#/">← Back to booking page</a>
          {typeof onSignOut === 'function' ? (
            <button className="adminBtn" onClick={onSignOut} disabled={loading || saving}>
              Sign out
            </button>
          ) : null}
          <button className="adminBtn" onClick={loadBookings} disabled={loading || saving}>
            Refresh
          </button>
        </div>
      </header>

      <main className="adminMain">
        <section className="adminCard adminBookingsCard">
          <div className="adminCardTitleRow">
            <h2>Bookings</h2>
            <div className="adminSmall">
              {loading ? 'Loading…' : `${filtered.length} shown • ${bookings.length} total`}
            </div>
          </div>

          <div className="adminFilters">
            <div className="adminField">
              <label>Search</label>
              <input
                value={filters.q}
                placeholder="Name, email, phone, notes…"
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              />
            </div>
            <div className="adminField">
              <label>Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="adminField">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {error ? <div className="adminError">{error}</div> : null}

          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Guests</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id ?? `${b.booking_date}-${b.time_slot}-${b.email}`}
                    className={selected && (selected.id != null ? selected.id === b.id : selected.booking_date === b.booking_date && selected.time_slot === b.time_slot && selected.email === b.email) ? 'isSelected' : ''}
                    onClick={() => selectBooking(b)}
                    role="button"
                    tabIndex={0}
                  >
                    <td>{b.booking_date}</td>
                    <td>{format12Hour(b.time_slot)}</td>
                    <td>{b.duration || 2}h</td>
                    <td>{b.name}</td>
                    <td className="adminMono">{b.email}</td>
                    <td>{b.guests}</td>
                    <td>{money.format(Number(b.amount || 0))}</td>
                    <td>
                      <span className={`adminStatus s-${String(b.status || 'pending').toLowerCase()}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="adminEmpty">
                      No bookings match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="adminBottomGrid">
          <section className="adminCard">
            <h2>Add booking</h2>
            <form className="adminForm" onSubmit={createBooking}>
              <div className="adminGrid2">
                <div className="adminField">
                  <label>Name</label>
                  <input value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="adminField">
                  <label>Phone</label>
                  <input value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} required />
                </div>
                <div className="adminField adminSpan2">
                  <label>Email</label>
                  <input type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="adminField">
                  <label>Date</label>
                  <input type="date" value={createForm.booking_date} onChange={(e) => setCreateForm((p) => ({ ...p, booking_date: e.target.value }))} required />
                </div>
                <div className="adminField">
                  <label>Time slot</label>
                  <TimePicker
                    value={createForm.time_slot}
                    onChange={(v) => setCreateForm((p) => ({ ...p, time_slot: v }))}
                    required
                  />
                  {createOverlap && (
                    <div className="adminFieldError">Conflicts with {createOverlap.start} – {createOverlap.end}</div>
                  )}
                </div>
                <div className="adminField">
                  <label>Duration (hrs)</label>
                  <input
                    type="number"
                    min={MIN_HOURS}
                    max={MAX_HOURS}
                    step="0.5"
                    value={createForm.duration}
                    onChange={(e) => setCreateForm((p) => ({ ...p, duration: e.target.value }))}
                    required
                  />
                </div>
                <div className="adminField">
                  <label>Guests</label>
                  <input type="number" min="1" max="40" step="1" value={createForm.guests} onChange={(e) => setCreateForm((p) => ({ ...p, guests: e.target.value }))} required />
                </div>
                <div className="adminField">
                  <label>Amount (INR)</label>
                  <input type="number" min="0" step="1" value={createForm.amount} onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div className="adminField">
                  <label>Status</label>
                  <select value={createForm.status} onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="adminField adminSpan2">
                  <label>Notes</label>
                  <textarea rows={3} value={createForm.notes} onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="adminActions">
                <button className="adminBtnPrimary" type="submit" disabled={saving || !!createOverlap}>
                  {saving ? 'Saving…' : 'Create booking'}
                </button>
                <button
                  type="button"
                  className="adminBtn"
                  disabled={saving}
                  onClick={() => setCreateForm(DEFAULT_CREATE)}
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          <section className="adminCard">
            <div className="adminCardTitleRow">
              <h2>Edit booking</h2>
              {selected ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="adminBtnDanger" onClick={cancelBooking} disabled={saving}>
                    Cancel
                  </button>
                  <button className="adminBtnDanger" onClick={deleteBookingPermanently} disabled={saving}>
                    Delete
                  </button>
                </div>
              ) : null}
            </div>

            {!selected || !editForm ? (
              <div className="adminEmptyBox">Select a booking from the table to edit it.</div>
            ) : (
              <form className="adminForm" onSubmit={saveEdits}>
                <div className="adminGrid2">
                  <div className="adminField">
                    <label>Name</label>
                    <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="adminField">
                    <label>Phone</label>
                    <input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} required />
                  </div>
                  <div className="adminField adminSpan2">
                    <label>Email</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div className="adminField">
                    <label>Date</label>
                    <input type="date" value={editForm.booking_date} onChange={(e) => setEditForm((p) => ({ ...p, booking_date: e.target.value }))} required />
                  </div>
                  <div className="adminField">
                    <label>Time slot</label>
                    <TimePicker
                      value={editForm.time_slot}
                      onChange={(v) => setEditForm((p) => ({ ...p, time_slot: v }))}
                      required
                    />
                    {editOverlap && (
                      <div className="adminFieldError">Conflicts with {editOverlap.start} – {editOverlap.end}</div>
                    )}
                  </div>
                  <div className="adminField">
                    <label>Duration (hrs)</label>
                    <input
                      type="number"
                      min={MIN_HOURS}
                      max={MAX_HOURS}
                      step="0.5"
                      value={editForm.duration}
                      onChange={(e) => setEditForm((p) => ({ ...p, duration: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="adminField">
                    <label>Guests</label>
                    <input type="number" min="1" max="40" step="1" value={editForm.guests} onChange={(e) => setEditForm((p) => ({ ...p, guests: e.target.value }))} required />
                  </div>
                  <div className="adminField">
                    <label>Amount (INR)</label>
                    <input type="number" min="0" step="1" value={editForm.amount} onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} required />
                  </div>
                  <div className="adminField">
                    <label>Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="adminField adminSpan2">
                    <label>Notes</label>
                    <textarea rows={3} value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
                <div className="adminActions">
                  <button className="adminBtnPrimary" type="submit" disabled={saving || !!editOverlap}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" className="adminBtn" disabled={saving} onClick={() => selectBooking(selected)}>
                    Reset edits
                  </button>
                </div>
              </form>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}
