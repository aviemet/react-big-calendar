import clsx from "clsx"

import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"

export interface EventCellProps<TEvent extends CalendarEvent = CalendarEvent> {
  event: TEvent
  slotStart: Date
  slotEnd: Date
  resizable?: boolean
  selected?: boolean
  isAllDay?: boolean
  continuesPrior?: boolean
  continuesAfter?: boolean
  onSelect?: (event: TEvent, e: React.MouseEvent<HTMLElement>) => void
  onDoubleClick?: (event: TEvent, e: React.MouseEvent<HTMLElement>) => void
  onKeyPress?: (event: TEvent, e: React.KeyboardEvent<HTMLElement>) => void
  children?: Function
  style?: React.CSSProperties
  className?: string
  type?: "date" | "time"
}

const EventCell = <TEvent extends CalendarEvent = CalendarEvent>({
  style,
  className,
  event,
  selected = false,
  isAllDay = false,
  onSelect,
  onDoubleClick,
  onKeyPress,
  continuesPrior = false,
  continuesAfter = false,
  children,
  slotStart,
  slotEnd,
  type = "date",
  ...props
}: EventCellProps<TEvent>) => {
  const { localizer, accessors, getters, components: {
    event: Event,
    eventWrapper: EventWrapper,
  } } = useCalendarContext()

  const title = accessors.title(event)
  const tooltip = accessors.tooltip(event)
  const end = accessors.end(event)
  const start = accessors.start(event)
  const allDay = accessors.allDay(event)

  const showAsAllDay =
      isAllDay ||
      allDay ||
      localizer.diff(start, localizer.ceil(end, "day"), "day") > 1

  const userProps = getters.eventProp(event, start, end, selected)

  return (
    <EventWrapper
      type={ type }
      event={ event }
      allDay={ isAllDay }
      continuesAfter={ continuesAfter }
      continuesPrior={ continuesPrior }
    >
      <div
        style={ { ...userProps.style, ...style } }
        className={ clsx("rbc-event", className, userProps.className, {
          "rbc-selected": selected,
          "rbc-event-allday": showAsAllDay,
          "rbc-event-continues-prior": continuesPrior,
          "rbc-event-continues-after": continuesAfter,
        }) }
        onClick={ (e) => onSelect?.(event, e) }
        onDoubleClick={ (e) => onDoubleClick?.(event, e) }
        onKeyDown={ (e) => onKeyPress?.(event, e) }
      >
        <div className="rbc-event-content" title={ tooltip || undefined }>
          <Event
            event={ event }
            continuesPrior={ continuesPrior }
            continuesAfter={ continuesAfter }
            title={ title }
            isAllDay={ allDay }
            slotStart={ slotStart }
            slotEnd={ slotEnd }
            localizer={ localizer }
          >
            { title }
          </Event>
        </div>
      </div>
    </EventWrapper>
  )
}

export { EventCell }
