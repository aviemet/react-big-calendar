import { useCalendarContext } from "@/Calendar"
import { DayColumn } from "./DayColumn"
import { CalendarEvent } from "@/utils/components"
import { Resource } from "@/utils/Resources"

interface DayColumnWrapperProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  date: Date
  id: string | number
  resource: TResource
  groupedEvents: Map<string | number, TEvent[]>
  groupedBackgroundEvents: Map<string | number, TEvent[]>
  min: Date
  max: Date
}

const DayColumnWrapper = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>({
  date,
  id,
  resource,
  groupedEvents,
  groupedBackgroundEvents,
  min,
  max,
}: DayColumnWrapperProps<TEvent, TResource>) => {
  const { localizer, accessors, getNow } = useCalendarContext()

  const daysEvents = (groupedEvents.get(id) || []).filter((event) =>
    localizer.inRange(
      date,
      accessors.start(event),
      accessors.end(event),
      "day"
    )
  )

  const daysBackgroundEvents = (groupedBackgroundEvents.get(id) || []).filter((event) => localizer.inRange(
    date,
    accessors.start(event),
    accessors.end(event),
    "day"
  ))

  return (
    <DayColumn
      key={ `${id}-${date}` }
      min={ localizer.merge(date, min) }
      max={ localizer.merge(date, max) }
      resourceId={ resource && id }
      isNow={ localizer.isSameDate(date, getNow()) }
      date={ date }
      events={ daysEvents }
      backgroundEvents={ daysBackgroundEvents }
    />
  )
}

export { DayColumnWrapper }
