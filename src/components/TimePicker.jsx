import { useEffect, useRef, useMemo, useCallback } from 'react'
import { TimepickerUI } from 'timepicker-ui'
import 'timepicker-ui/index.css'
import 'timepicker-ui/theme-m3-green.css'
import './TimePicker.css'

const WINDOW_START_MINUTES = 7 * 60
const WINDOW_END_MINUTES = 23 * 60
const DEFAULT_MINUTE_STEP = 30

function buildSlot(minutes) {
  const hour24 = Math.floor(minutes / 60)
  const minute = minutes % 60
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  const period = hour24 < 12 ? 'AM' : 'PM'
  const display = `${hour12}:${String(minute).padStart(2, '0')} ${period}`
  const value = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  return { display, value }
}

export const TIME_SLOTS = []
for (let mins = WINDOW_START_MINUTES; mins <= WINDOW_END_MINUTES; mins += DEFAULT_MINUTE_STEP) {
  TIME_SLOTS.push(buildSlot(mins))
}

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null
  const [hStr, mStr] = timeStr.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

function to12Hour(time24) {
  if (!time24) return ''
  const mins = timeToMinutes(time24)
  if (mins === null) return ''
  const h24 = Math.floor(mins / 60)
  const m = mins % 60
  const period = h24 < 12 ? 'AM' : 'PM'
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

function to24Hour(time12) {
  if (!time12 || typeof time12 !== 'string') return ''
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return ''
  let h = Number(match[1])
  const m = Number(match[2])
  const period = match[3].toUpperCase()
  if (period === 'AM' && h === 12) h = 0
  else if (period === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function TimePicker({
  value,
  onChange,
  id,
  required,
  disabled,
  placeholder = 'Choose start time',
  slotStatusByValue = null,
  variant = 'default',
  minuteStep = DEFAULT_MINUTE_STEP
}) {
  const inputRef = useRef(null)
  const pickerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const isBookingVariant = variant === 'booking'
  const hasSlotStatusData = Boolean(slotStatusByValue && Object.keys(slotStatusByValue).length > 0)
  const normalizedStep = Math.max(1, Math.floor(Number(minuteStep || DEFAULT_MINUTE_STEP)))

  onChangeRef.current = onChange

  const disabledTime = useMemo(() => {
    if (!(isBookingVariant && hasSlotStatusData)) return null

    const disabledHours = new Set()
    const disabledMinutes = new Set()

    for (let mins = WINDOW_START_MINUTES; mins <= WINDOW_END_MINUTES; mins += normalizedStep) {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      const slotKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const status = slotStatusByValue?.[slotKey]?.status
      if (status && status !== 'available') {
        disabledMinutes.add(m)
      }
    }

    // Build disabled hours: hours where ALL minutes in step are unavailable
    for (let h = 7; h <= 23; h++) {
      let allDisabled = true
      for (let m = 0; m < 60; m += normalizedStep) {
        const slotKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        const status = slotStatusByValue?.[slotKey]?.status
        if (!status || status === 'available') {
          allDisabled = false
          break
        }
      }
      if (allDisabled) {
        // Convert to 12h for the picker
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
        disabledHours.add(String(h12))
      }
    }

    // Build disabled intervals from contiguous booked ranges
    const intervals = []
    let rangeStart = null
    for (let mins = WINDOW_START_MINUTES; mins <= WINDOW_END_MINUTES; mins += normalizedStep) {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      const slotKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const status = slotStatusByValue?.[slotKey]?.status
      const isUnavailable = status && status !== 'available'

      if (isUnavailable && rangeStart === null) {
        rangeStart = mins
      } else if (!isUnavailable && rangeStart !== null) {
        const startSlot = buildSlot(rangeStart)
        const endSlot = buildSlot(mins)
        intervals.push(`${startSlot.display} - ${endSlot.display}`)
        rangeStart = null
      }
    }
    if (rangeStart !== null) {
      const startSlot = buildSlot(rangeStart)
      const endSlot = buildSlot(WINDOW_END_MINUTES)
      intervals.push(`${startSlot.display} - ${endSlot.display}`)
    }

    if (intervals.length === 0) return null
    return { interval: intervals }
  }, [isBookingVariant, hasSlotStatusData, slotStatusByValue, normalizedStep])

  const hasAvailableSlot = useMemo(() => {
    if (!(isBookingVariant && hasSlotStatusData)) return true
    return Object.values(slotStatusByValue || {}).some((meta) => meta?.status === 'available')
  }, [isBookingVariant, hasSlotStatusData, slotStatusByValue])

  const isPickerDisabled = disabled || !hasAvailableSlot

  const handleConfirm = useCallback((data) => {
    if (!data?.hour || !data?.minutes) return
    const h = String(data.hour).padStart(2, '0')
    const m = String(data.minutes).padStart(2, '0')
    const type = data.type || 'AM'
    const time24 = to24Hour(`${h}:${m} ${type}`)

    if (time24) {
      const mins = timeToMinutes(time24)
      if (mins !== null && mins >= WINDOW_START_MINUTES && mins <= WINDOW_END_MINUTES) {
        onChangeRef.current?.(time24)
      }
    }
  }, [])

  // Create / recreate picker when disabled state or options change
  useEffect(() => {
    const el = inputRef.current
    if (!el || isPickerDisabled) {
      if (pickerRef.current) {
        try { pickerRef.current.destroy() } catch {}
        pickerRef.current = null
      }
      return
    }

    // Destroy previous instance
    if (pickerRef.current) {
      try { pickerRef.current.destroy() } catch {}
      pickerRef.current = null
    }

    const options = {
      clock: {
        type: '12h',
        incrementMinutes: normalizedStep,
        autoSwitchToMinutes: true,
        ...(disabledTime ? { disabledTime } : {})
      },
      ui: {
        theme: 'm3-green',
        animation: true,
        enableSwitchIcon: true,
        editable: true,
        mobile: false
      },
      labels: {
        ok: 'Confirm',
        cancel: 'Cancel',
        time: 'Pick a time'
      },
      behavior: {
        focusInputAfterClose: false,
        ...(id ? { id } : {})
      },
      callbacks: {
        onConfirm: handleConfirm
      }
    }

    const picker = new TimepickerUI(el, options)
    picker.create()
    pickerRef.current = picker

    return () => {
      try { picker.destroy() } catch {}
      pickerRef.current = null
    }
  }, [isPickerDisabled, disabledTime, normalizedStep, id, handleConfirm])

  // Sync value to input when value prop changes externally
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    const display = value ? to12Hour(value) : ''
    if (el.value !== display) {
      el.value = display
    }
    if (pickerRef.current && value) {
      try { pickerRef.current.setValue(display, false) } catch {}
    }
  }, [value])

  return (
    <div className={`timePicker ${isBookingVariant ? 'isBookingVariant' : ''}`}>
      <input
        ref={inputRef}
        type="text"
        id={id}
        placeholder={isPickerDisabled ? (disabled ? placeholder : 'No slots available') : placeholder}
        readOnly
        required={required}
        disabled={isPickerDisabled}
        className="timePickerInput"
        data-timepicker-input
      />
    </div>
  )
}
