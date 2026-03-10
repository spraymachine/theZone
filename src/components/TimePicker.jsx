import { useEffect, useRef, useState } from 'react'
import './TimePicker.css'

// Generate time slots: 12-hour format, :00 and :30 only
export const TIME_SLOTS = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hour24 = h
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const period = h < 12 ? 'AM' : 'PM'
    const display = `${hour12}:${String(m).padStart(2, '0')} ${period}`
    const value = `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    TIME_SLOTS.push({ display, value, hour24, minute: m, period })
  }
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

export default function TimePicker({
  value,
  onChange,
  id,
  required,
  disabled,
  placeholder = 'Select time',
  slotStatusByValue = null,
  showLegend = false
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('AM') // 'AM' or 'PM'
  const containerRef = useRef(null)
  const listRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Scroll to selected time when opened
  useEffect(() => {
    if (open && listRef.current && value) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]')
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center', behavior: 'instant' })
      }
    }
  }, [open, value])

  const filteredSlots = TIME_SLOTS.filter(s => s.period === filter)

  const displayValue = format12Hour(value)
  const hasSlotStatusData = Boolean(slotStatusByValue && Object.keys(slotStatusByValue).length > 0)

  const slotCounts = filteredSlots.reduce((acc, slot) => {
    const status = slotStatusByValue?.[slot.value]?.status || 'available'
    if (status === 'booked') acc.booked += 1
    else if (status === 'unavailable') acc.unavailable += 1
    else acc.available += 1
    return acc
  }, { available: 0, booked: 0, unavailable: 0 })

  return (
    <div className="timePicker" ref={containerRef}>
      <button
        type="button"
        id={id}
        className={`timePickerTrigger ${open ? 'isOpen' : ''} ${value ? '' : 'isEmpty'}`}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="timePickerValue">
          {displayValue || placeholder}
        </span>
        <svg className="timePickerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </button>

      {open && (
        <div className="timePickerDropdown">
          <div className="timePickerFilters">
            <button
              type="button"
              className={`timePickerFilterBtn ${filter === 'AM' ? 'isActive' : ''}`}
              onClick={() => setFilter('AM')}
            >
              AM
            </button>
            <button
              type="button"
              className={`timePickerFilterBtn ${filter === 'PM' ? 'isActive' : ''}`}
              onClick={() => setFilter('PM')}
            >
              PM
            </button>
          </div>

          <div className="timePickerList" ref={listRef} role="listbox">
            {showLegend && hasSlotStatusData && (
              <div className="timePickerLegend" aria-hidden="true">
                <span className="timePickerLegendItem available">
                  {slotCounts.available} available
                </span>
                <span className="timePickerLegendItem booked">
                  {slotCounts.booked} booked
                </span>
                <span className="timePickerLegendItem unavailable">
                  {slotCounts.unavailable} unavailable
                </span>
              </div>
            )}

            {filteredSlots.map((slot) => {
              const status = slotStatusByValue?.[slot.value]?.status || 'available'
              const isSelectable = status === 'available'
              const statusLabel = status === 'booked'
                ? 'Booked'
                : status === 'unavailable'
                  ? 'Unavailable'
                  : 'Available'

              return (
                <button
                  key={slot.value}
                  type="button"
                  role="option"
                  aria-selected={value === slot.value}
                  data-selected={value === slot.value}
                  className={`timePickerOption ${value === slot.value ? 'isSelected' : ''} ${hasSlotStatusData ? `is-${status}` : ''}`}
                  disabled={hasSlotStatusData && !isSelectable}
                  onClick={() => {
                    onChange(slot.value)
                    setOpen(false)
                  }}
                >
                  <span className="timePickerOptionTime">{slot.display}</span>
                  {hasSlotStatusData ? (
                    <span className={`timePickerOptionStatus ${status}`}>
                      {statusLabel}
                    </span>
                  ) : (
                    <span className={`timePickerOptionPeriod ${slot.period.toLowerCase()}`}>
                      {slot.period}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ''}
          onChange={() => {}}
          required
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          tabIndex={-1}
        />
      )}
    </div>
  )
}
