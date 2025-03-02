import { DateLocalizer } from '@/localizers'
import { Components, CalendarEvent } from '@/types'
import Header from '@/Header'

interface MonthHeaderProps<TEvent extends CalendarEvent = CalendarEvent> {
  dates: Date[]
  components: Components<TEvent, object>
  localizer: DateLocalizer
}

function MonthHeader<TEvent extends CalendarEvent = CalendarEvent>({
  dates,
  components,
  localizer,
}: MonthHeaderProps<TEvent>) {
  const first = dates[0]
  const last = dates[dates.length - 1]
  const HeaderComponent = components.header || Header

  return (
    <div className="rbc-row rbc-month-header" role="row">
      { localizer.range(first, last, 'day').map((day, idx) => (
        <div key={ 'header_' + idx } className="rbc-header">
          <HeaderComponent
            date={ day }
            localizer={ localizer }
            label={ localizer.format(day, 'weekdayFormat') }
          />
        </div>
      )) }
    </div>
  )
}

export default MonthHeader
