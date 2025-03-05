import { CalendarEvent } from '@/types'
import EventRowMixin, { Event, EventRowSpan } from './EventRowMixin'
import clsx from 'clsx'

interface EventRowProps<TEvent extends CalendarEvent> {
  segments: TEvent[]
  slotMetrics: { slots: number }
  className: string
}

const EventRow = <TEvent extends CalendarEvent>(props: EventRowProps<TEvent>) => {
  const {
    segments,
    slotMetrics,
    className,
  } = props

  let lastEnd = 1

  // const old = segments.reduce((row, { event, left, right, span }, li) => {
  //   let key = '_lvl_' + li
  //   let gap = left - lastEnd

  //   let content = EventRowMixin.renderEvent(props, event)

  //   if(gap) row.push(EventRowMixin.renderSpan(slotMetrics.slots, gap, `${key}_gap`))

  //   row.push(EventRowMixin.renderSpan(slotMetrics.slots, span, key, content))

  //   // lastEnd = right + 1

  //   return row
  // }, [])

  return (
    <div className={ clsx(className, 'rbc-row') }>
      { segments.map(({ event, left, right, span }, li) => {

        let key = '_lvl_' + li
        let gap = left - lastEnd

        lastEnd = right + 1

        return (
          <>
            { Boolean(gap) && <EventRowSpan slots={ slotMetrics.slots } len={ gap } key={ `${key}_gap` } /> }
            <EventRowSpan slots={ slotMetrics.slots } len={ span } key={ `${key}_gap` }>
              <Event event={ event } { ...props } />
            </EventRowSpan>
          </>
        )
      }) }
    </div>
  )
}

export default EventRow
