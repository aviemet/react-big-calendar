import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"
import { Resource } from "@/utils/Resources"

import { DayColumn } from "./DayColumn"

interface DayColumnWrapperProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  date: Date
  id: string | number
  resource: TResource
  groupedEvents: Map<string | number, TEvent[]>
  groupedBackgroundEvents: Map<string | number, TEvent[]>
  min: Date
  max: Date
  step?: number
  timeslots: number
}

const DayColumnWrapper = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>({
  date,
  id,
  resource,
  groupedEvents,
  groupedBackgroundEvents,
  min,
  max,
  step = 30,
  timeslots,
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
      step={ step }
      resourceId={ resource && id }
      isNow={ localizer.isSameDate(date, getNow()) }
      date={ date }
      events={ daysEvents }
      backgroundEvents={ daysBackgroundEvents }
      timeslots={ timeslots }
      showMultiDayTimes
      // selected
      // eventOffset
      // longPressThreshold
      // showMultiDayTimes
    />
  )
}

export { DayColumnWrapper }
