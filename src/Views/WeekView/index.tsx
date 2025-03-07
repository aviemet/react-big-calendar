import { navigate } from "@/utils/move"
import TimeGrid from "@/components/TimeGrid"
import { BaseViewProps, createViewComponent, ViewComponent } from ".."
import { DateLocalizer } from "@/localizers"
import { useCalendarContext } from "@/components/Calendar"
import { CalendarEvent } from "@/utils/components"

export interface WeekViewProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  eventOffset?: number
  Selectable: "ignoreEvents"
  getDrilldownView: null
}

const weekViewRange: ViewComponent<WeekViewProps>["range"] = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  let firstOfWeek = localizer.startOfWeek()
  let start = localizer.startOf(date, "week", firstOfWeek)
  let end = localizer.endOf(date, "week", firstOfWeek)

  return { start, end }
}

const WeekView = <TEvent extends CalendarEvent = CalendarEvent>(props: WeekViewProps<TEvent>) => {
  const { localizer, date } = useCalendarContext()

  /**
   * This allows us to default min, max, and scrollToTime
   * using our localizer. This is necessary until such time
   * as TimeGrid is converted to a functional component.
   */
  const {
    eventOffset = 15, // TODO: 0 or 15 or default undefined?
    min = localizer.startOf(new Date(), "day"),
    max = localizer.endOf(new Date(), "day"),
    scrollToTime = localizer.startOf(new Date(), "day"),
    enableAutoScroll = true,
  } = props

  const { start, end }  = weekViewRange(date, { localizer })
  const range = localizer.range(start, end)

  return (<>
    <TimeGrid
      { ...props }
      range={ range }
      eventOffset={ eventOffset }
      min={ min }
      max={ max }
      scrollToTime={ scrollToTime }
      enableAutoScroll={ enableAutoScroll }
    /></>
  )

}

export default createViewComponent(WeekView, {
  range: weekViewRange,

  navigate: (date, action, { localizer }) => {
    switch(action) {
      case navigate.PREVIOUS:
        return localizer.add(date, -1, "week")
      case navigate.NEXT:
        return localizer.add(date, 1, "week")
      default:
        return date
    }
  },

  title: (date, { localizer }) => {
    let { start, end } = weekViewRange(date, { localizer })
    return localizer.format({ start, end }, "dayRangeHeaderFormat")
  },
})
