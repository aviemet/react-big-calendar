import EventRowMixin from './EventRowMixin'
import clsx from 'clsx'

interface EventRowProps {
  segments: Event[]
  slotMetrics: { slots: number }
  className: string
}

const EventRow = (props: EventRowProps) => {
  const {
    segments,
    slotMetrics,
    className,
  } = props

  let lastEnd = 1

  return (
    <div className={ clsx(className, 'rbc-row') }>
      { segments.reduce((row, { event, left, right, span }, li) => {
        let key = '_lvl_' + li
        let gap = left - lastEnd

        let content = EventRowMixin.renderEvent(props, event)

        if(gap) row.push(EventRowMixin.renderSpan(slotMetrics.slots, gap, `${key}_gap`))

        row.push(EventRowMixin.renderSpan(slotMetrics.slots, span, key, content))

        lastEnd = right + 1

        return row
      }, []) }
    </div>
  )
}

// EventRow.propTypes = {
//   segments: PropTypes.array,
//   ...EventRowMixin.propTypes,
// }

// EventRow.defaultProps = {
//   ...EventRowMixin.defaultProps,
// }

export default EventRow
