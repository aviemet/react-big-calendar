import Header from '@/Header'
import clsx from 'clsx'
import { useCalendarContext } from '@/components/Calendar'

interface HeadersProps {
  row: Date[]
}

const Headers = ({ row }: HeadersProps) => {
  const { localizer, components } = useCalendarContext()

  let first = row[0]
  let last = row[row.length - 1]

  let HeaderComponent = components.header || Header

  return (
    <div className="rbc-row rbc-month-header" role="row">{
      localizer.range(first, last, 'day').map((day, index) => (
        <div key={ 'header_' + index } className={ clsx("rbc-header") }>
          <HeaderComponent
            date={ day }
            localizer={ localizer }
            label={ localizer.format(day, 'weekdayFormat') }
          />
        </div>
      ))
    }</div>
  )
}

export default Headers
