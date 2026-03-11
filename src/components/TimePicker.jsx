import { useMemo } from 'react'
import dayjs from 'dayjs'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

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

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null
  const [hStr, mStr] = timeStr.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

function getSlotStatus(timeStr, slotStatusByValue, hasSlotStatusData) {
  if (!hasSlotStatusData) return 'available'
  return slotStatusByValue?.[timeStr]?.status || 'available'
}

export const TIME_SLOTS = []
for (let mins = WINDOW_START_MINUTES; mins <= WINDOW_END_MINUTES; mins += DEFAULT_MINUTE_STEP) {
  TIME_SLOTS.push(buildSlot(mins))
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
  const normalizedStep = Math.max(1, Math.floor(Number(minuteStep || DEFAULT_MINUTE_STEP)))
  const isBookingVariant = variant === 'booking'
  const hasSlotStatusData = Boolean(slotStatusByValue && Object.keys(slotStatusByValue).length > 0)

  const selectedValue = value && dayjs(value, 'HH:mm').isValid() ? dayjs(value, 'HH:mm') : null
  const minTime = dayjs('07:00', 'HH:mm')
  const maxTime = dayjs('23:00', 'HH:mm')

  const hasAvailableSlot = useMemo(() => {
    if (!(isBookingVariant && hasSlotStatusData)) return true
    return Object.values(slotStatusByValue || {}).some((meta) => meta?.status === 'available')
  }, [isBookingVariant, hasSlotStatusData, slotStatusByValue])

  const isPickerDisabled = disabled || !hasAvailableSlot

  function isSelectableSlot(slotValue) {
    const mins = timeToMinutes(slotValue)
    if (mins === null) return false
    if (mins < WINDOW_START_MINUTES || mins > WINDOW_END_MINUTES) return false
    if (mins % normalizedStep !== 0) return false
    if (isBookingVariant && hasSlotStatusData) {
      return getSlotStatus(slotValue, slotStatusByValue, hasSlotStatusData) === 'available'
    }
    return true
  }

  function hasAnySelectableMinuteInHour(hour) {
    for (let m = 0; m < 60; m += normalizedStep) {
      const slot = `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      if (isSelectableSlot(slot)) return true
    }
    return false
  }

  function shouldDisableTime(timeValue, clockView) {
    if (!timeValue || !dayjs(timeValue).isValid()) return true
    if (clockView === 'hours') {
      return !hasAnySelectableMinuteInHour(dayjs(timeValue).hour())
    }
    const slot = dayjs(timeValue).format('HH:mm')
    return !isSelectableSlot(slot)
  }

  function handleChange(newValue) {
    if (!newValue || !dayjs(newValue).isValid()) {
      onChange?.('')
      return
    }
    const next = dayjs(newValue).format('HH:mm')
    if (isSelectableSlot(next)) {
      onChange?.(next)
    }
  }

  return (
    <div className={`timePicker ${isBookingVariant ? 'isBookingVariant' : ''}`}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MobileTimePicker
          value={selectedValue}
          onChange={handleChange}
          disabled={isPickerDisabled}
          ampm
          ampmInClock={false}
          minutesStep={normalizedStep}
          minTime={minTime}
          maxTime={maxTime}
          shouldDisableTime={isBookingVariant && hasSlotStatusData ? shouldDisableTime : undefined}
          slotProps={{
            textField: {
              id,
              required,
              placeholder,
              fullWidth: true,
              size: 'small'
            },
            mobilePaper: {
              className: 'timePickerDialog'
            },
            toolbar: {
              sx: {
                gap: '24px',
                '& .MuiTimePickerToolbar-ampmSelection': {
                  marginLeft: '24px',
                  paddingLeft: '24px',
                  borderLeft: '1px solid rgba(0,0,0,0.12)',
                  '& button': {
                    opacity: 0.7,
                    fontWeight: 500,
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    minWidth: 48,
                    '&.Mui-selected': {
                      opacity: 1,
                      fontWeight: 700,
                      background: 'rgba(0,0,0,0.1)',
                      borderColor: 'rgba(0,0,0,0.35)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)'
                    }
                  }
                }
              }
            },
            ...(hasSlotStatusData && {
              timeClock: {
                sx: {
                  '& .MuiClockNumber-root:not(.Mui-disabled)': {
                    color: '#047857'
                  },
                  '& .MuiClockNumber-root.Mui-disabled': {
                    color: '#B91C1C'
                  }
                }
              }
            })
          }}
        />
      </LocalizationProvider>
    </div>
  )
}
