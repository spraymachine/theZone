import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default function MaterialDatePicker({ id, value, onChange, minDate, disabled, required }) {
  const selectedDate = value ? dayjs(value, 'YYYY-MM-DD') : null
  const minDay = minDate ? dayjs(minDate, 'YYYY-MM-DD') : dayjs().startOf('day')

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={selectedDate}
        onChange={(nextValue) => {
          const normalized = nextValue && nextValue.isValid() ? nextValue.format('YYYY-MM-DD') : ''
          onChange?.(normalized)
        }}
        minDate={minDay}
        disabled={disabled}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            id,
            required,
            fullWidth: true,
            size: 'small',
            sx: {
              '& .MuiOutlinedInput-root': {
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'var(--border-light)'
                },
                '&:hover fieldset': {
                  borderColor: 'var(--border-medium)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--brand-accent)'
                }
              },
              '& .MuiInputBase-input': {
                color: 'var(--text-primary)',
                padding: '14px 16px',
                fontSize: '15px'
              },
              '& .MuiSvgIcon-root': {
                color: 'var(--text-primary)'
              }
            }
          },
          popper: {
            sx: {
              '& .MuiPaper-root': {
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              },
              '& .MuiPickersDay-root': {
                color: 'var(--text-primary)'
              },
              '& .MuiPickersDay-root.Mui-selected': {
                backgroundColor: 'var(--brand-accent)',
                color: 'var(--text-light)'
              },
              '& .MuiPickersDay-root.Mui-selected:hover': {
                backgroundColor: 'var(--brand-accent-hover)'
              },
              '& .MuiPickersCalendarHeader-root, & .MuiPickersArrowSwitcher-root button, & .MuiDayCalendar-weekDayLabel': {
                color: 'var(--text-secondary)'
              }
            }
          }
        }}
      />
    </LocalizationProvider>
  )
}
