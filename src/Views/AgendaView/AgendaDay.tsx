import React from 'react'
import { inRange } from '@/utils/eventLevels'
import { isSelected } from '@/utils/eventSelectionHelpers'
import { CalendarEvent, Components } from '@/types'
import { Getters } from '@/types'
import { Accessors } from '@/utils/accessors'
import { Resource } from '@/utils/Resources'
import { useCalendarContext } from '@/Calendar'

interface DayProps<TEvent extends CalendarEvent = CalendarEvent> {
  day: Date
  events: TEvent[]
  dayKey: string
  accessors: Accessors<TEvent>
  getters: Getters<TEvent>
  selected: TEvent[]
  components: Components<TEvent, Resource>
  timeRangeLabel: (day: Date, event: TEvent) => React.ReactNode
  onSelectEvent: (event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void
  onDoubleClickEvent: (event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void
}

const Day = ({
  day,
  events,
  dayKey,
  accessors,
  getters,
  selected,
  components,
  timeRangeLabel,
  onSelectEvent,
  onDoubleClickEvent,
}: DayProps) => {
  const { localizer } = useCalendarContext()

  const { event: EventComponent, date: AgendaDate } = components

  events = events.filter((e) =>
    inRange(
      e,
      localizer.startOf(day, 'day'),
      localizer.endOf(day, 'day'),
      accessors,
      localizer
    )
  )

  return events.map((event, Index) => {
    let title = accessors.title(event)
    let end = accessors.end(event)
    let start = accessors.start(event)

    const userProps = getters.eventProp(
      event,
      start,
      end,
      isSelected(event, selected)
    )

    let dateLabel = Index === 0 && localizer.format(day, 'agendaDateFormat')
    let first =
      Index === 0
        ? (
          <td rowSpan={ events.length } className="rbc-agenda-date-cell">
            { AgendaDate
              ? (
                <AgendaDate day={ day } label={ dateLabel } />
              )
              : (
                dateLabel
              ) }
          </td>
        )
        : (
          false
        )

    return (
      <tr
        key={ dayKey + '_' + Index }
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

export default Day
