import Header from '@/Header'
import { useCalendarContext } from '@/Calendar'

interface MonthHeaderProps {
  dates: Date[]
}

function MonthHeader({
  dates,
}: MonthHeaderProps) {
  const { localizer, components } = useCalendarContext()

  const first = dates[0]
  const last = dates[dates.length - 1]
  const HeaderComponent = components.header || Header

  return (
    <div className="rbc-row rbc-month-header" role="row">
      { localizer.range(first, last, 'day').map((day, idx) => (
        <div key={ 'header_' + idx } className="rbc-header">
          <HeaderComponent
            date={ day }
            label={ localizer.format(day, 'weekdayFormat') }
          />
        </div>
      )) }
    </div>
  )
}

export default MonthHeader
