import { inRange } from "@/utils/eventLevels"
import { isSelected } from "@/utils/eventSelectionHelpers"
import { useCalendarContext } from "@/components/Calendar"
import { CalendarEvent } from "@/utils/components"

interface DayProps<TEvent extends CalendarEvent = CalendarEvent> {
  day: Date
  events: TEvent[]
  dayKey: string
  selected: TEvent[]
  timeRangeLabel: (day: Date, event: TEvent) => React.ReactNode
  onSelectEvent: (event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void
  onDoubleClickEvent: (event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void
}

const Day = ({
  day,
  events,
  dayKey,
  selected,
  timeRangeLabel,
  onSelectEvent,
  onDoubleClickEvent,
}: DayProps) => {
  const { localizer, accessors, getters, components: {
    event: EventComponent,
    date: AgendaDate,
  } } = useCalendarContext()

  events = events.filter((e) =>
    inRange(
      e,
      localizer.startOf(day, "day"),
      localizer.endOf(day, "day"),
      accessors,
      localizer
    )
  )

  return events.map((event, index) => {
    let title = accessors.title(event)
    let end = accessors.end(event)
    let start = accessors.start(event)

    const userProps = getters.eventProp(
      event,
      start,
      end,
      isSelected(event, selected)
    )

    let dateLabel = index === 0 && localizer.format(day, "agendaDateFormat")
    let first =
      index === 0
        ? <td rowSpan={ events.length } className="rbc-agenda-date-cell">
          { AgendaDate
            ? <AgendaDate day={ day } label={ dateLabel } />
            : dateLabel
          }
        </td>
        : false

    return (
      <tr
        key={ dayKey }
        className={ userProps.className }
        style={ userProps.style }
      >
        { first }
        <td className="rbc-agenda-time-cell">{ timeRangeLabel(day, event) }</td>
        <td
          className="rbc-agenda-event-cell"
          onClick={ (e) => onSelectEvent && onSelectEvent(event, e) }
          onDoubleClick={ (e) =>
            onDoubleClickEvent && onDoubleClickEvent(event, e)
          }
        >
          { EventComponent ? <EventComponent event={ event } title={ title } /> : title }
        </td>
      </tr>
    )
  })
}

export { Day }
