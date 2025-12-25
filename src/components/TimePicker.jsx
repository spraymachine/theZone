import { useEffect, useRef, useState } from 'react'
import './TimePicker.css'

// Generate time slots: 12-hour format, :00 and :30 only
const TIME_SLOTS = []
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

export default function TimePicker({ value, onChange, id, required, disabled }) {
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
          {displayValue || 'Select time'}
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
            {filteredSlots.map((slot) => (
              <button
                key={slot.value}
                type="button"
                role="option"
                aria-selected={value === slot.value}
                data-selected={value === slot.value}
                className={`timePickerOption ${value === slot.value ? 'isSelected' : ''}`}
                onClick={() => {
                  onChange(slot.value)
                  setOpen(false)
                }}
              >
                <span className="timePickerOptionTime">{slot.display.split(' ')[0]}</span>
                <span className={`timePickerOptionPeriod ${slot.period.toLowerCase()}`}>
                  {slot.period}
                </span>
              </button>
            ))}
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

