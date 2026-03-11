import { useMemo } from 'react'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  PickersLayoutContentWrapper,
  PickersLayoutRoot,
  usePickerLayout
} from '@mui/x-date-pickers/PickersLayout'
import './TimePicker.css'

dayjs.extend(customParseFormat)

const WINDOW_START_MINUTES = 7 * 60
const WINDOW_END_MINUTES = 23 * 60
const DEFAULT_MINUTE_STEP = 30
const STATUS_LABELS = {
  available: 'Free',
  booked: 'Booked',
  unavailable: 'Unavailable'
}
const STATUS_ORDER = ['available', 'booked', 'unavailable']

function buildSlot(minutes) {
  const hour24 = Math.floor(minutes / 60)
  const minute = minutes % 60
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  const period = hour24 < 12 ? 'AM' : 'PM'
  const display = `${hour12}:${String(minute).padStart(2, '0')} ${period}`
  const value = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  return { display, value }
}

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null
  const [hStr, mStr] = timeStr.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
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
  if (!Number.isFinite(h) || !Number.isFinite(m)) return ''
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const period = h < 12 ? 'AM' : 'PM'
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function buildSlots(stepMinutes) {
  const normalizedStep = Math.max(1, Math.floor(Number(stepMinutes || DEFAULT_MINUTE_STEP)))
  const slots = []
  for (let mins = WINDOW_START_MINUTES; mins <= WINDOW_END_MINUTES; mins += normalizedStep) {
    slots.push(buildSlot(mins))
  }
  return slots
}

function isAllowedSlot(timeStr, minuteStep = DEFAULT_MINUTE_STEP) {
  const mins = timeToMinutes(timeStr)
  if (mins === null) return false
  if (mins < WINDOW_START_MINUTES || mins > WINDOW_END_MINUTES) return false

  const normalizedStep = Math.max(1, Math.floor(Number(minuteStep || DEFAULT_MINUTE_STEP)))
  return mins % normalizedStep === 0
}

function getSlotStatus(timeStr, slotStatusByValue, hasSlotStatusData) {
  if (!hasSlotStatusData) return 'available'
  return slotStatusByValue?.[timeStr]?.status || 'available'
}

function formatRange(start, end) {
  if (start === end) return format12Hour(start)
  return `${format12Hour(start)} - ${format12Hour(end)}`
}

function buildAvailabilitySummary(slotStatusByValue, hasSlotStatusData) {
  if (!hasSlotStatusData) return null

  const counts = {
    available: 0,
    booked: 0,
    unavailable: 0
  }

  const rangesByStatus = {
    available: [],
    booked: [],
    unavailable: []
  }

  let currentStatus = null
  let rangeStart = null
  let previousMinutes = null

  for (let mins = WINDOW_START_MINUTES; mins <= WINDOW_END_MINUTES; mins += 1) {
    const slot = minutesToTimeStr(mins)
    const status = getSlotStatus(slot, slotStatusByValue, hasSlotStatusData)

    if (!counts[status]) counts[status] = 0
    counts[status] += 1

    if (currentStatus === status) {
      previousMinutes = mins
      continue
    }

    if (currentStatus && rangeStart !== null && previousMinutes !== null) {
      rangesByStatus[currentStatus].push({
        start: minutesToTimeStr(rangeStart),
        end: minutesToTimeStr(previousMinutes)
      })
    }

    currentStatus = status
    rangeStart = mins
    previousMinutes = mins
  }

  if (currentStatus && rangeStart !== null && previousMinutes !== null) {
    rangesByStatus[currentStatus].push({
      start: minutesToTimeStr(rangeStart),
      end: minutesToTimeStr(previousMinutes)
    })
  }

  return {
    counts,
    rangesByStatus
  }
}

function BookingAvailabilityLayout(props) {
  const { toolbar, tabs, content, actionBar, shortcuts, ownerState } = usePickerLayout(props)
  const summary = props.availabilitySummary

  return (
    <PickersLayoutRoot className={props.className} ownerState={ownerState}>
      {toolbar}
      {shortcuts}
      <PickersLayoutContentWrapper ownerState={ownerState}>
        {tabs}
        {content}

        {summary ? (
          <div className="timePickerAvailabilityPanel">
            <div className="timePickerAvailabilityLegend">
              {STATUS_ORDER.map((status) => (
                <span key={status} className={`timePickerStatusChip ${status}`}>
                  {STATUS_LABELS[status]}: {summary.counts[status] || 0}
                </span>
              ))}
            </div>

            <div className="timePickerAvailabilityRanges">
              {STATUS_ORDER.map((status) => {
                const ranges = summary.rangesByStatus[status] || []
                return (
                  <div key={status} className="timePickerAvailabilityRow">
                    <span className={`timePickerAvailabilityLabel ${status}`}>{STATUS_LABELS[status]}</span>
                    <span className="timePickerAvailabilityText">
                      {ranges.length
                        ? ranges.map((range) => formatRange(range.start, range.end)).join(' • ')
                        : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </PickersLayoutContentWrapper>
      {actionBar}
    </PickersLayoutRoot>
  )
}

// Backward-compatible export for places that depend on 30-minute slot arrays.
export const TIME_SLOTS = buildSlots(DEFAULT_MINUTE_STEP)

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
  const normalizedMinuteStep = Math.max(1, Math.floor(Number(minuteStep || DEFAULT_MINUTE_STEP)))
  const isBookingVariant = variant === 'booking'
  const hasSlotStatusData = Boolean(slotStatusByValue && Object.keys(slotStatusByValue).length > 0)

  const pickerSlots = useMemo(
    () => (isBookingVariant ? { layout: BookingAvailabilityLayout } : undefined),
    [isBookingVariant]
  )

  const availableSlots = useMemo(() => {
    const slotsInStep = buildSlots(normalizedMinuteStep)
    if (!isBookingVariant || !hasSlotStatusData) {
      return slotsInStep
    }

    return slotsInStep.filter((slot) => getSlotStatus(slot.value, slotStatusByValue, hasSlotStatusData) === 'available')
  }, [normalizedMinuteStep, isBookingVariant, hasSlotStatusData, slotStatusByValue])

  const availabilitySummary = useMemo(
    () => (isBookingVariant ? buildAvailabilitySummary(slotStatusByValue, hasSlotStatusData) : null),
    [isBookingVariant, slotStatusByValue, hasSlotStatusData]
  )

  const hasAvailableSlots = availableSlots.length > 0
  const selectedStatus = value ? getSlotStatus(value, slotStatusByValue, hasSlotStatusData) : 'available'
  const isUnavailableSelection = isBookingVariant && hasSlotStatusData && value && selectedStatus !== 'available'
  const selectedValue = value ? dayjs(value, 'HH:mm') : null
  const minTime = dayjs('07:00', 'HH:mm')
  const maxTime = dayjs('23:00', 'HH:mm')

  function isSelectableSlot(slotValue) {
    if (!isAllowedSlot(slotValue, normalizedMinuteStep)) return false
    if (isBookingVariant && hasSlotStatusData) {
      return getSlotStatus(slotValue, slotStatusByValue, hasSlotStatusData) === 'available'
    }
    return true
  }

  function isHourDisabled(hourValue) {
    const safeHour = Number(hourValue)
    if (!Number.isFinite(safeHour)) return true

    for (let minute = 0; minute < 60; minute += normalizedMinuteStep) {
      const slot = `${String(safeHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      if (isSelectableSlot(slot)) {
        return false
      }
    }

    return true
  }

  function handleChange(nextValue) {
    const next = nextValue && dayjs(nextValue).isValid() ? dayjs(nextValue).format('HH:mm') : ''

    if (!next) {
      onChange?.('')
      return
    }

    if (!isSelectableSlot(next)) {
      onChange?.('')
      return
    }

    onChange?.(next)
  }

  return (
    <div className={`timePicker ${isBookingVariant ? 'isBookingVariant' : ''}`}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MobileTimePicker
          value={selectedValue}
          onChange={handleChange}
          ampm
          ampmInClock
          minutesStep={normalizedMinuteStep}
          minTime={minTime}
          maxTime={maxTime}
          slots={pickerSlots}
          disabled={disabled || (isBookingVariant && hasSlotStatusData && !hasAvailableSlots)}
          shouldDisableTime={(timeValue, view) => {
            if (!timeValue || !dayjs(timeValue).isValid()) return true

            if (view === 'hours') {
              return isHourDisabled(dayjs(timeValue).hour())
            }

            if (view === 'minutes') {
              const slot = dayjs(timeValue).format('HH:mm')
              return !isSelectableSlot(slot)
            }

            return false
          }}
          slotProps={{
            textField: {
              id,
              required,
              size: 'small',
              fullWidth: true,
              className: `timePickerInput ${isUnavailableSelection ? 'isInvalid' : ''}`,
              placeholder
            },
            desktopPaper: {
              className: 'timePickerPaper'
            },
            mobilePaper: {
              className: 'timePickerPaper'
            },
            dialog: {
              className: 'timePickerDialog'
            },
            actionBar: {
              actions: ['cancel', 'accept']
            },
            layout: {
              availabilitySummary
            }
          }}
        />
      </LocalizationProvider>

      {isUnavailableSelection ? (
        <span className="timePickerSupport isError">Selected time is no longer available</span>
      ) : null}
    </div>
  )
}
