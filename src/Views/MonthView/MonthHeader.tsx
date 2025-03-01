import React from 'react'
import { DateLocalizer } from '@/localizers'
import { Components } from '@/types'
import Header from '@/Header'

interface MonthHeaderProps {
  dates: Date[]
  components: Components<Event, object>
  localizer: DateLocalizer
}

const MonthHeader: React.FC<MonthHeaderProps> = ({
  dates,
  components,
  localizer,
}) => {
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
