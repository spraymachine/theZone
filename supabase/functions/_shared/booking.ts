export const MIN_HOURS = 3
export const MAX_HOURS = 24

const ADD_ON_FEES: Record<string, number> = {
  cleaning: 400,
  projector: 250,
  sound: 300,
  catering: 500
}

export type BookingPayload = {
  eventType: string
  otherEventPurpose?: string
  date: string
  startTime: string
  hours: number
  guests: number
  addOns?: Record<string, boolean>
  name: string
  email: string
  phone: string
  notes?: string
}

export function toMinutes(time: string): number | null {
  const parts = String(time).split(':')
  if (parts.length !== 2) return null
  const hh = Number(parts[0])
  const mm = Number(parts[1])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
  return hh * 60 + mm
}

export function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  let aStart = startA
  let aEnd = endA
  let bStart = startB
  let bEnd = endB

  if (aEnd <= aStart) aEnd += 24 * 60
  if (bEnd <= bStart) bEnd += 24 * 60

  return aStart < bEnd && bStart < aEnd
}

export function calculateAmountInInr(date: string, hours: number, addOns?: Record<string, boolean>): number {
  const bookingDate = new Date(date)
  if (Number.isNaN(bookingDate.getTime())) {
    throw new Error('Invalid booking date.')
  }

  if (!Number.isFinite(hours) || hours < MIN_HOURS || hours > MAX_HOURS) {
    throw new Error(`Booking duration must be between ${MIN_HOURS} and ${MAX_HOURS} hours.`)
  }

  const day = bookingDate.getDay()
  const weekday = day >= 1 && day <= 4
  const base = weekday ? 3499 : 4499
  const additionalPerHour = weekday ? 1000 : 1299

  const additionalHours = Math.max(0, hours - MIN_HOURS)
  const baseTotal = base + additionalHours * additionalPerHour

  const addOnTotal = Object.entries(addOns ?? {}).reduce((sum, [key, selected]) => {
    if (!selected) return sum
    return sum + (ADD_ON_FEES[key] ?? 0)
  }, 0)

  return Math.round(baseTotal + addOnTotal)
}

export function buildMergedNotes(payload: BookingPayload): string | null {
  const other = String(payload.otherEventPurpose || '').trim()
  const notes = String(payload.notes || '').trim()

  if (payload.eventType === 'other' && other) {
    return `Other event purpose: ${other}${notes ? `\n\nNotes: ${notes}` : ''}`
  }

  return notes || null
}

export function normalizePayload(input: unknown): BookingPayload {
  const obj = (input || {}) as Record<string, unknown>

  const payload: BookingPayload = {
    eventType: String(obj.eventType || ''),
    otherEventPurpose: String(obj.otherEventPurpose || ''),
    date: String(obj.date || ''),
    startTime: String(obj.startTime || ''),
    hours: Number(obj.hours || 0),
    guests: Number(obj.guests || 0),
    addOns: (obj.addOns as Record<string, boolean>) || {},
    name: String(obj.name || '').trim(),
    email: String(obj.email || '').trim(),
    phone: String(obj.phone || '').trim(),
    notes: String(obj.notes || '')
  }

  if (!payload.name || !payload.email || !payload.phone) {
    throw new Error('Name, email, and phone are required.')
  }

  if (!payload.date || !payload.startTime) {
    throw new Error('Booking date and start time are required.')
  }

  if (!payload.eventType) {
    throw new Error('Event type is required.')
  }

  if (!Number.isFinite(payload.hours) || payload.hours < MIN_HOURS || payload.hours > MAX_HOURS) {
    throw new Error(`Booking duration must be between ${MIN_HOURS} and ${MAX_HOURS} hours.`)
  }

  if (!Number.isFinite(payload.guests) || payload.guests < 1) {
    throw new Error('Guest count must be at least 1.')
  }

  if (toMinutes(payload.startTime) === null) {
    throw new Error('Invalid start time format.')
  }

  return payload
}
