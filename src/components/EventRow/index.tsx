import clsx from "clsx"
import React from "react"

import { DateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { CalendarEvent } from "@/utils/components"

import { Event, EventRowSpan } from "./EventRowMixin"

interface EventRowProps<TEvent extends CalendarEvent> {
  segments: TEvent[]
  slotMetrics: DateSlotMetrics<TEvent>
  className: string
  weekIndex: number
  selected?: TEvent | null
  onSelect?: (event: TEvent) => void
  onDoubleClick?: (event: TEvent) => void
  onKeyPress?: (event: TEvent) => void
  resourceId?: string | number
  resizable?: boolean
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
          <React.Fragment key={ `${key}_gap_${++gap}` }>
            { Boolean(gap) && <EventRowSpan slots={ slotMetrics.slots } len={ gap } /> }
            <EventRowSpan slots={ slotMetrics.slots } len={ span }>
              <Event event={ event } { ...props } />
            </EventRowSpan>
          </React.Fragment>
        )
      }) }
    </div>
  )
}

export { EventRow }
