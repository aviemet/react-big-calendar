import EventRowMixin from './EventRowMixin'
import { eventLevels } from '@/utils/eventLevels'
import { range } from 'lodash-es'
import clsx from 'clsx'
import { useCalendarContext } from '../Calendar'

let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot
let eventsInSlot = (segments, slot) =>
  segments.filter((seg) => isSegmentInSlot(seg, slot)).map((seg) => seg.event)

// EventEndingRow.propTypes = {
//   segments: PropTypes.array,
//   slots: PropTypes.number,
//   onShowMore: PropTypes.func,
//   ...EventRowMixin.propTypes,
// }

// EventEndingRow.defaultProps = {
//   ...EventRowMixin.defaultProps,
// }

interface EventEndingRowProps {
  segments: Event[]
  slotMetrics: { slots: number }
  onShowMore: (slot: number, e: React.MouseEvent<HTMLElement>) => void
}

const EventEndingRow = ({
  segments,
  slotMetrics,
  ...props
}: EventEndingRowProps) => {
  const { localizer, components } = useCalendarContext()

  const canRenderSlotEvent = (slot: number, span: number) => {
    return range(slot, slot + span).every((s) => {
      const count = eventsInSlot(segments, s).length

      return count === 1
    })
  }

  const renderShowMore = (segments, slot) => {
    const events = slotMetrics.getEventsForSlot(slot)
    const remainingEvents = eventsInSlot(segments, slot)
    const count = remainingEvents.length

    if(components?.showMore) {
      const ShowMore = components.showMore
      // The received slot seems to be 1-based, but the range we use to pull the date is 0-based
      const slotDate = slotMetrics.getDateForSlot(slot - 1)

      return count
        ? (
          <ShowMore
            localizer={ localizer }
            slotDate={ slotDate }
            slot={ slot }
            count={ count }
            events={ events }
            remainingEvents={ remainingEvents }
          />
        )
        : (
          false
        )
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
      : (
        false
      )
  }

  const showMore = (slot, e) => {
    e.preventDefault()
    e.stopPropagation()
    props.onShowMore(slot, e.target)
  }

  let rowSegments = eventLevels(segments).levels[0]

  let current = 1,
      lastEnd = 1,
      row = []

  while(current <= slotMetrics.slots) {
    let key = '_lvl_' + current

    let { event, left, right, span } =
        rowSegments.filter((seg) => isSegmentInSlot(seg, current))[0] || {}

    if(!event) {
      current++
      continue
    }

    let gap = Math.max(0, left - lastEnd)

    if(canRenderSlotEvent(left, span)) {
      let content = EventRowMixin.renderEvent(props, event)

      if(gap) {
        row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
      }

      row.push(EventRowMixin.renderSpan(slots, span, key, content))

      lastEnd = current = right + 1
    } else {
      if(gap) {
        row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
      }

      row.push(
        EventRowMixin.renderSpan(
          slots,
          1,
          key,
          renderShowMore(segments, current)
        )
      )
      lastEnd = current = current + 1
    }
  }

  return <div className="rbc-row">{ row }</div>

}


export default EventEndingRow
