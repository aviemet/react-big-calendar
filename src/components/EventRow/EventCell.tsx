// import { EventWrapper } from "@/addons/dragAndDrop/EventWrapper"
import clsx from "clsx"
import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"

interface EventCellProps {
  event: CalendarEvent
  slotStart: Date
  slotEnd: Date
  resizable: boolean
  selected: boolean
  isAllDay: boolean
  continuesPrior: boolean
  continuesAfter: boolean
  onSelect: (event: CalendarEvent, e: React.MouseEvent<HTMLElement>) => void
  onDoubleClick: (event: CalendarEvent, e: React.MouseEvent<HTMLElement>) => void
  onKeyPress: (event: CalendarEvent, e: React.KeyboardEvent<HTMLElement>) => void
  children?: Function
  style?: React.CSSProperties
  className?: string
}

const EventCell = ({
  style,
  className,
  event,
  selected,
  isAllDay,
  onSelect,
  onDoubleClick,
  onKeyPress,
  continuesPrior,
  continuesAfter,
  children,
  slotStart,
  slotEnd,
  ...props
}: EventCellProps) => {
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

  // Todo: EventWrapper is possibly redeclared for drag and drop addon
  return (
    <EventWrapper { ...props } type="date">
      <div
        { ...props }
        style={ { ...userProps.style, ...style } }
        className={ clsx("rbc-event", className, userProps.className, {
          "rbc-selected": selected,
          "rbc-event-allday": showAsAllDay,
          "rbc-event-continues-prior": continuesPrior,
          "rbc-event-continues-after": continuesAfter,
        }) }
        onClick={ (e) => onSelect && onSelect(event, e) }
        onDoubleClick={ (e) => onDoubleClick && onDoubleClick(event, e) }
        onKeyDown={ (e) => onKeyPress && onKeyPress(event, e) }
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
          >
            { title }
          </Event>
        </div>
      </div>
    </EventWrapper>
  )
}

export { EventCell }
