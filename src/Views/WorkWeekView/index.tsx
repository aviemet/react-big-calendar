import { BaseViewProps, createViewComponent, ViewComponent } from '@/Views'
import TimeGrid from '@/components/TimeGrid'
import WeekView from '../WeekView'
import { useCalendarContext } from '@/Calendar'
import { CalendarEvent } from '@/utils/components'

const workWeekRange: ViewComponent<WorkWeekProps>['range'] = (date, { localizer }) => {
  let start = localizer.startOf(date, 'week', 1)
  let end = localizer.add(start, 4, 'day')

  return { start, end }
}

export interface WorkWeekProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  date: Date
  min?: Date
  max?: Date
  scrollToTime?: Date
  enableAutoScroll?: boolean
  eventOffset?: number
}

const WorkWeek = <TEvent extends CalendarEvent = CalendarEvent>(props: WorkWeekProps<TEvent>) => {
  const { localizer, date } = useCalendarContext()

  const {
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
      min={ min }
      max={ max }
      scrollToTime={ scrollToTime }
      enableAutoScroll={ enableAutoScroll }
    />
  )
}

export default createViewComponent(WorkWeek, {
  range: workWeekRange,
  navigate: WeekView.navigate,
  title: (date, { localizer }) => {
    let { start, end } = workWeekRange(date, { localizer })
    return localizer.format({ start, end }, 'dayRangeHeaderFormat')
  },
})
