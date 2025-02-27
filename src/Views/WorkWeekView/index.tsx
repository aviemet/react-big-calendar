import { useCalendarContext } from '@/components/Calendar'
import { BaseViewProps, ViewComponent } from '@/Views'
import TimeGrid from '../TimeGridView'
import { DateLocalizer } from '@/localizers'
import WeekView from '../WeekView'

const workWeekRange = (date: Date, options: { localizer: DateLocalizer }) => {
  return WeekView.range(date, options).filter(
    (d) => [6, 0].indexOf(d.getDay()) === -1
  )
}

interface WorkWeekProps extends BaseViewProps {
  date: Date
  min?: Date
  max?: Date
  scrollToTime?: Date
  enableAutoScroll?: boolean
}

const WorkWeek: ViewComponent<WorkWeekProps> = (props) => {
  const { localizer } = useCalendarContext()

  const {
    date,
    min = localizer.startOf(new Date(), 'day'),
    max = localizer.endOf(new Date(), 'day'),
    scrollToTime = localizer.startOf(new Date(), 'day'),
    enableAutoScroll = true,
  } = props

  /**
   * This allows us to default min, max, and scrollToTime
   * using our localizer. This is necessary until such time
   * as TimeGrid is converted to a functional component.
   */
  const range = workWeekRange(date, { localizer })
  return (
    <TimeGrid
      { ...props }
      range={ range }
      eventOffset={ 15 }
      localizer={ localizer }
      min={ min }
      max={ max }
      scrollToTime={ scrollToTime }
      enableAutoScroll={ enableAutoScroll }
    />
  )

}

WorkWeek.range = workWeekRange

WorkWeek.navigate = WeekView.navigate

WorkWeek.title = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  let [start, ...rest] = workWeekRange(date, { localizer })

  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat')
}

export default WorkWeek
