import { CalendarEvent } from "@/utils/components"
import { Event, EventRowSpan } from "./EventRowMixin"
import clsx from "clsx"

interface EventRowProps<TEvent extends CalendarEvent> {
  segments: TEvent[]
  slotMetrics: { slots: number }
  className: string
  weekIndex: number
}

const EventRow = <TEvent extends CalendarEvent>(props: EventRowProps<TEvent>) => {
  const {
    segments,
    slotMetrics,
    weekIndex,
    className,
  } = props

  let lastEnd = 1

  return (
    <div className={ clsx(className, "rbc-row") }>
      { segments.map(({ event, left, right, span }, li) => {

        let key = `row_${weekIndex}_lvl_${li}`
        let gap = left - lastEnd

        lastEnd = right + 1

        return (
          <>
            { Boolean(gap) && <EventRowSpan slots={ slotMetrics.slots } len={ gap } key={ `${key}_gap_${gap}` } /> }
            <EventRowSpan slots={ slotMetrics.slots } len={ span } key={ `${key}_gap_${++gap}` }>
              <Event event={ event } { ...props } />
            </EventRowSpan>
          </>
        )
      }) }
    </div>
  )
}

export { EventRow }
