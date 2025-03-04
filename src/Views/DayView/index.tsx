import { navigate } from '@/utils/constants'
import TimeGrid from '../../components/TimeGrid'
import { BaseViewProps, createViewComponent, ViewComponent } from '..'
import { coerceDate } from '@/utils/helpers'
import { CalendarEvent } from '@/types'
import { useCalendarContext } from '@/Calendar'

interface DayViewProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  enableAutoScroll?: boolean
  resizable?: boolean
  allDayMaxRows?: number
  showAllEvents?: boolean
  doShowMoreDrillDown?: boolean
  popup?: boolean
  handleDragStart?: (event: React.DragEvent) => void
  popupOffset?: number | { x: number, y: number }
}


const dayViewRange: ViewComponent<DayViewProps>['range'] = (date: Date, { localizer }) => {
  return [localizer.startOf(date, 'day')]
}

const DayView = <TEvent extends CalendarEvent = CalendarEvent>(props: DayViewProps<TEvent>) => {
  const { localizer, date } = useCalendarContext()

  /**
   * This allows us to default min, max, and scrollToTime
   * using our localizer. This is necessary until such time
   * as TODO: TimeGrid is converted to a functional component.
   */
  const {
    min = localizer.startOf(new Date(), 'day'),
    max = localizer.endOf(new Date(), 'day'),
    scrollToTime = localizer.startOf(new Date(), 'day'),
    enableAutoScroll = true,
  } = props
  let range = dayViewRange(coerceDate(date), { localizer: localizer })

  return (
    <TimeGrid
      { ...props }
      range={ range }
      eventOffset={ 10 }
      min={ min }
      max={ max }
      scrollToTime={ scrollToTime }
      enableAutoScroll={ enableAutoScroll }
    />
  )
}

export default createViewComponent(DayView, {
  range: dayViewRange,
  navigate: (date, action, { localizer }) => {
    switch(action) {
      case navigate.PREVIOUS:
        return localizer.add(date, -1, 'day')

      case navigate.NEXT:
        return localizer.add(date, 1, 'day')

      default:
        return date
    }
  },
  title: (date, { localizer }) => localizer.format(date, 'dayHeaderFormat'),
})
