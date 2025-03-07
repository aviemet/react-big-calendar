import { useRef, useEffect } from "react"
import addClass from "dom-helpers/addClass"
import removeClass from "dom-helpers/removeClass"
import getWidth from "dom-helpers/width"
import scrollbarSize from "dom-helpers/scrollbarSize"
import { navigate } from "@/utils/move"
import { inRange } from "@/utils/eventLevels"
import { BaseViewProps, createViewComponent } from ".."
import { useCalendarContext } from "@/components/Calendar"
import { CalendarEvent } from "@/utils/components"
import Day from "./AgendaDay"

const DEFAULT_LENGTH = 30

export interface AgendaViewProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  length?: number
}

const AgendaView = <TEvent extends CalendarEvent = CalendarEvent>({
  events,
  length = DEFAULT_LENGTH,
  onDoubleClickEvent,
  onSelectEvent,
  selected,
}: AgendaViewProps<TEvent>) => {
  const { localizer, accessors, date, components: {
    time: TimeComponent,
  } } = useCalendarContext()

  const headerRef = useRef<HTMLTableElement>(null)
  const dateColRef = useRef<HTMLTableCellElement>(null)
  const timeColRef = useRef<HTMLTableCellElement>(null)
  const contentRef = useRef<HTMLTableElement>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)

  useEffect(() => {
    adjustHeader()
  })

  const timeRangeLabel = (day, event) => {
    let labelClass = ""
    let label = localizer.messages.allDay

    const end = accessors.end(event)
    const start = accessors.start(event)

    if(!accessors.allDay(event)) {
      if(localizer.eq(start, end)) {
        label = localizer.format(start, "agendaTimeFormat")
      } else if(localizer.isSameDate(start, end)) {
        label = localizer.format({ start, end }, "agendaTimeRangeFormat")
      } else if(localizer.isSameDate(day, start)) {
        label = localizer.format(start, "agendaTimeFormat")
      } else if(localizer.isSameDate(day, end)) {
        label = localizer.format(end, "agendaTimeFormat")
      }
    }

    if(localizer.gt(day, start, "day")) labelClass = "rbc-continues-prior"
    if(localizer.lt(day, end, "day")) labelClass += " rbc-continues-after"

    return (
      <span className={ labelClass.trim() }>
        <TimeComponent event={ event } day={ day } label={ label }>
          { label }
        </TimeComponent>
      </span>
    )
  }

  const adjustHeader = () => {
    if(!tbodyRef.current) return

    let header = headerRef.current
    let firstRow = tbodyRef.current.firstChild

    if(!firstRow) return

    let isOverflowing = contentRef.current.scrollHeight > contentRef.current.clientHeight

    let widths = []

    let _widths = [getWidth(firstRow.children[0]), getWidth(firstRow.children[1])]

    if(widths[0] !== _widths[0] || widths[1] !== _widths[1]) {
      dateColRef.current.style.width = _widths[0] + "px"
      timeColRef.current.style.width = _widths[1] + "px"
    }

    if(isOverflowing) {
      addClass(header, "rbc-header-overflowing")
      header.style.marginRight = scrollbarSize() + "px"
    } else {
      removeClass(header, "rbc-header-overflowing")
    }
  }

  let { messages } = localizer
  let end = localizer.add(date, length, "day")

  let range = localizer.range(date, end, "day")

  events = events.filter((event) =>
    inRange(
      event,
      localizer.startOf(date, "day"),
      localizer.endOf(end, "day"),
      accessors,
      localizer
    )
  )

  events.sort((a, b) => +accessors.start(a) - +accessors.start(b))

  return (
    <div className="rbc-agenda-view">
      { events.length !== 0
        ? <>
          <table ref={ headerRef } className="rbc-agenda-table">
            <thead>
              <tr>
                <th className="rbc-header" ref={ dateColRef }>
                  { messages.date }
                </th>
                <th className="rbc-header" ref={ timeColRef }>
                  { messages.time }
                </th>
                <th className="rbc-header">{ messages.event }</th>
              </tr>
            </thead>
          </table>
          <div className="rbc-agenda-content" ref={ contentRef }>
            <table className="rbc-agenda-table">
              <tbody ref={ tbodyRef }>
                { range.map((day, Index) => (
                  <Day
                    day={ day }
                    events={ events }
                    dayKey={ day.toISOString() }
                    selected={ selected }
                    timeRangeLabel={ timeRangeLabel }
                    onSelectEvent={ onSelectEvent }
                    onDoubleClickEvent={ onDoubleClickEvent }
                  />
                )) }
              </tbody>
            </table>
          </div>
        </>
        : <span className="rbc-agenda-empty">{ messages.noEventsInRange }</span>
      }
    </div>
  )
}

export default createViewComponent(AgendaView, {
  range: (start, { length = DEFAULT_LENGTH, localizer }) => {
    let end = localizer.add(start, length, "day")
    return { start, end }
  },

  navigate: (
    date,
    action,
    { length = DEFAULT_LENGTH, localizer }
  ) => {
    switch(action) {
      case navigate.PREVIOUS:
        return localizer.add(date, -length, "day")

      case navigate.NEXT:
        return localizer.add(date, length, "day")

      default:
        return date
    }
  },

  title: (start, { length = DEFAULT_LENGTH, localizer }) => {
    let end = localizer.add(start, length, "day")
    return localizer.format({ start, end }, "agendaHeaderFormat")
  },
})
