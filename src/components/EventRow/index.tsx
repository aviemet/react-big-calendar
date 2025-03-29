import clsx from "clsx"
import React from "react"

import { DateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { CalendarEvent } from "@/utils/components"
import { EventSegment } from "@/utils/eventLevels"
import { isSelected } from "@/utils/eventSelectionHelpers"

import { EventCell } from "./EventCell"
import { EventRowSpan } from "./EventRowSpan"

interface EventRowProps<TEvent extends CalendarEvent> {
  segments: EventSegment<TEvent>[]
  slotMetrics: DateSlotMetrics<TEvent>
  className?: string
  selected?: TEvent | null
  onSelect?: (event: TEvent) => void
  onDoubleClick?: (event: TEvent) => void
  onKeyPress?: (event: TEvent) => void
  resourceId?: string | number
  resizable?: boolean
}

const EventRow = <TEvent extends CalendarEvent = CalendarEvent>({
  segments,
  slotMetrics,
  className,
  selected,
  onSelect,
  onDoubleClick,
  onKeyPress,
  resizable,
}: EventRowProps<TEvent>) => {
  let lastEnd = 1

  // Use reduce to build the array of row elements
  const rowElements = segments.reduce<React.ReactNode[]>((row, { event, left, right, span }) => {
    const key = `event_${event.id}_${span}_${left}_${right}`
    const gap = left - lastEnd

    if(gap > 0) {
      row.push(
        <EventRowSpan
          key={ `${key}_gap` }
          slots={ slotMetrics.slots }
          len={ gap }
        />
      )
    }

    row.push(
      <EventRowSpan
        key={ key }
        slots={ slotMetrics.slots }
        len={ span }
      >
        <EventCell
          event={ event }
          continuesPrior={ slotMetrics.continuesPrior(event) }
          continuesAfter={ slotMetrics.continuesAfter(event) }
          slotStart={ slotMetrics.first }
          slotEnd={ slotMetrics.last }
          selected={ isSelected(event, selected) }
          onSelect={ onSelect }
          onDoubleClick={ onDoubleClick }
          onKeyPress={ onKeyPress }
          resizable={ resizable }

        />
      </EventRowSpan>
    )

    lastEnd = right + 1

    return row
  }, [])

  return (
    <div className={ clsx(className, "rbc-row") }>
      { rowElements }
    </div>
  )
}

export { EventRow }
