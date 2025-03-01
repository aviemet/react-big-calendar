import { useCalendarContext } from '@/components/Calendar'
import { BaseViewProps, createViewComponent, ViewComponent } from '@/Views'
import TimeGrid from '../TimeGridView'
import WeekView from '../WeekView'
import { CalendarEvent } from '@/types'

const workWeekRange: ViewComponent<WorkWeekProps>['range'] = (date, options) => {
  return WeekView.range(date, options).filter(
    (d) => [6, 0].indexOf(d.getDay()) === -1
  )
}

interface WorkWeekProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  date: Date
  min?: Date
  max?: Date
  scrollToTime?: Date
  enableAutoScroll?: boolean
}

const WorkWeek = <TEvent extends CalendarEvent = CalendarEvent>(props: WorkWeekProps<TEvent>) => {
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

export default createViewComponent(WorkWeek, {
  range: workWeekRange,
  navigate: WeekView.navigate,
  title: (date, { localizer }) => {
    let [start, ...rest] = workWeekRange(date, { localizer })
    return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat')
  },
})
