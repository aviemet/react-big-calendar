import { navigate } from "@/utils/moveDate"
import { TimeGrid } from "@/components/TimeGrid"
import { BaseViewProps, createViewComponent } from "@/Views"
import { useCalendarContext } from "@/components/Calendar"
import { CalendarEvent } from "@/utils/components"

export interface DayViewProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  enableAutoScroll?: boolean
  resizable?: boolean
  allDayMaxRows?: number
  showAllEvents?: boolean
  doShowMoreDrillDown?: boolean
  popup?: boolean
  handleDragStart?: (event: React.DragEvent) => void
  popupOffset?: number | { x: number, y: number }
  eventOffset?: number
}

const DayViewComponent = <TEvent extends CalendarEvent = CalendarEvent>(props: DayViewProps<TEvent>) => {
  const { localizer, date } = useCalendarContext()

  /**
   * This allows us to default min, max, and scrollToTime
   * using our localizer. This is necessary until such time
   * as TODO: TimeGrid is converted to a functional component.
   */
  const {
    min = localizer.startOf(new Date(), "day"),
    max = localizer.endOf(new Date(), "day"),
    scrollToTime = localizer.startOf(new Date(), "day"),
    enableAutoScroll = true,
  } = props

  return (
    <TimeGrid
      { ...props }
      range={ [localizer.startOf(date, "day")] }
      eventOffset={ 10 }
      min={ min }
      max={ max }
      scrollToTime={ scrollToTime }
      enableAutoScroll={ enableAutoScroll }
    />
  )
}

export const DayView = createViewComponent(DayViewComponent, {
  range: (date: Date, { localizer }) => {
    return { start: localizer.startOf(date, "day"), end: localizer.endOf(date, "day") }
  },
  navigate: (date, action, { localizer }) => {
    switch(action) {
      case navigate.PREVIOUS:
        return localizer.add(date, -1, "day")

      case navigate.NEXT:
        return localizer.add(date, 1, "day")

      default:
        return date
    }
  },
  title: (date, { localizer }) => localizer.format(date, "dayHeaderFormat"),
})
