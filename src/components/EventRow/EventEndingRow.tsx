import { Event, EventRowSpan } from './EventRowMixin'
import { eventLevels } from '@/utils/eventLevels'
import { range } from 'lodash-es'
import clsx from 'clsx'
import { CalendarEvent } from '@/types'
import { SlotMetrics } from '@/hooks/useTimeSlotMetrics'
import { useCalendarContext } from '@/Calendar'

const isSegmentInSlot = (seg: { left: number, right: number }, slot: number) => seg.left <= slot && seg.right >= slot
const eventsInSlot = (segments: { event: CalendarEvent }[], slot: number) => {
  return segments.filter((seg) => isSegmentInSlot(seg, slot)).map((seg) => seg.event)
}

interface EventEndingRowProps {
  segments: CalendarEvent[]
  slotMetrics: SlotMetrics
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
    let key = '_lvl_' + current

    const { event, left, right, span } =
        rowSegments.filter((seg) => isSegmentInSlot(seg, current))[0] || {}

    if(!event) {
      current++
      continue
    }

    const gap = Math.max(0, left - lastEnd)

    if(canRenderSlotEvent(left, span)) {
      // const content = EventRowMixin.renderEvent(props, event)
      const content = <Event event={ event } { ...props } />

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

      row.push(
        // EventRowMixin.renderSpan(
        //   slots,
        //   1,
        //   key,
        //   <ShowMore segments={ segments } slotMetrics={ slotMetrics } slot={ current } components={ components } onShowMore={ onShowMore } />
        // )

        row.push(<EventRowSpan slots={ slots } len={ 1 } key={ key }>
          <ShowMore segments={ segments } slotMetrics={ slotMetrics } slot={ current } onShowMore={ onShowMore } />
        </EventRowSpan>)
      )
      lastEnd = current = current + 1
    }
  }

  return <div className="rbc-row">{ row }</div>
}

export default EventEndingRow

interface ShowMoreProps {
  segments: CalendarEvent[]
  slotMetrics: SlotMetrics
  slot: number
  onShowMore: (slot: number, e: React.MouseEvent<HTMLElement>) => void
}

const ShowMore = ({ segments, slotMetrics, slot, onShowMore }: ShowMoreProps) => {
  const { localizer, components } = useCalendarContext()

  const events = slotMetrics.getEventsForSlot(slot)
  const remainingEvents = eventsInSlot(segments, slot)
  const count = remainingEvents.length

  const showMore = (slot, e) => {
    e.preventDefault()
    e.stopPropagation()
    onShowMore(slot, e.target)
  }

  if(components?.showMore) {
    const ShowMoreComponent = components.showMore
    // The received slot seems to be 1-based, but the range we use to pull the date is 0-based
    const slotDate = slotMetrics.getDateForSlot(slot - 1)

    return count
      ? (
        <ShowMoreComponent
          slotDate={ slotDate }
          slot={ slot }
          count={ count }
          events={ events }
          remainingEvents={ remainingEvents }
        />
      )
      : false
  }

  return count
    ? (
      <button
        type="button"
        key={ 'sm_' + slot }
        className={ clsx('rbc-button-link', 'rbc-show-more') }
        onClick={ (e) => showMore(slot, e) }
      >
        { localizer.messages.showMore(count, remainingEvents, events) }
      </button>
    )
    : <></>
}
