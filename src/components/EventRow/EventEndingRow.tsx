import { range } from "lodash-es"

import { DateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { CalendarEvent } from "@/utils/components"
import { eventLevels } from "@/utils/eventLevels"

import { EventCell } from "./EventCell"
import { EventRowSpan } from "./EventRowSpan"
import { ShowMore } from "./ShowMore"

export const isSegmentInSlot = (seg: { left: number, right: number }, slot: number) => seg.left <= slot && seg.right >= slot

export const eventsInSlot = (segments: { event: CalendarEvent }[], slot: number) => {
  return segments.filter((seg) => isSegmentInSlot(seg, slot)).map((seg) => seg.event)
}

interface EventEndingRowProps {
  segments: CalendarEvent[]
  slotMetrics: DateSlotMetrics
  onShowMore: (slot: number, e: React.MouseEvent<HTMLElement>) => void
}

const EventEndingRow = ({
  segments,
  slotMetrics,
  onShowMore,
}: EventEndingRowProps) => {
  const { slots } = slotMetrics

  const canRenderSlotEvent = (slot: number, span: number) => {
    return range(slot, slot + span).every((s) => {
      const count = eventsInSlot(segments, s).length

      return count === 1
    })
  }

  let rowSegments = eventLevels(segments).levels[0]

  let current = 1
  let lastEnd = 1
  let row = []

  while(current <= slots) {
    let key = `row_lvl_${current}`

    const { event, left, right, span } =
        rowSegments.filter((seg) => isSegmentInSlot(seg, current))[0] || {}

    if(!event) {
      current++
      continue
    }

    const gap = Math.max(0, left - lastEnd)

    if(canRenderSlotEvent(left, span)) {
      // const content = EventRowMixin.renderEvent(props, event)
      const content = <EventCell
        event={ event }
        continuesPrior={ slotMetrics.continuesPrior(event) }
        continuesAfter={ slotMetrics.continuesAfter(event) }
        slotStart={ slotMetrics.first }
        slotEnd={ slotMetrics.last }
      />

      if(Boolean(gap)) {
        // row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        row.push(<EventRowSpan slots={ slots } len={ gap } key={ `${key}_gap` } />)
      }

      // row.push(EventRowMixin.renderSpan(slots, span, key, content))
      row.push(<EventRowSpan slots={ slots } len={ span } key={ key }>
        { content }
      </EventRowSpan>)

      lastEnd = current = right + 1
    } else {
      if(Boolean(gap)) {
        // row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        row.push(<EventRowSpan slots={ slots } len={ gap } key={ `${key}_gap` } />)
      }

      // row.push(
      // EventRowMixin.renderSpan(
      //   slots,
      //   1,
      //   key,
      //   <ShowMore segments={ segments } slotMetrics={ slotMetrics } slot={ current } components={ components } onShowMore={ onShowMore } />
      // )
      // )
      row.push(<EventRowSpan slots={ slots } len={ 1 } key={ key }>
        <ShowMore
          segments={ segments }
          slotMetrics={ slotMetrics }
          slot={ current }
          onShowMore={ onShowMore }
        />
      </EventRowSpan>)

      lastEnd = current = current + 1
    }
  }

  return <div className="rbc-row">{ row }</div>
}

export { EventEndingRow }

