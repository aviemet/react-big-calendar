import { stringifyPercent } from '@/utils/helpers'
import EventWrapper from '@/addons/dragAndDrop/EventWrapper'
import * as DayEventLayout from '@/utils/DayEventLayout'
import { SlotMetrics } from '@/utils/TimeSlots'
import { Accessors, Getters } from '@/types'
import clsx from 'clsx'

interface TimeGridEventsProps {
  style?: React.CSSProperties
  className?: string
  events: Event[]
  isBackgroundEvent?: boolean
  accessors: Accessors
  getters: Getters
  rtl?: boolean
  selected?: boolean
  slotMetrics: SlotMetrics
  label: string
  continuesPrior: boolean
  continuesAfter: boolean
  onClick?: (event: Event, e: React.MouseEvent<HTMLElement>) => void
  onDoubleClick?: (event: Event, e: React.MouseEvent<HTMLElement>) => void
  onKeyPress?: (event: Event, e: React.KeyboardEvent<HTMLElement>) => void
  components: { event: Event, eventWrapper: EventWrapper }
}

const TimeGridEvents = (props: TimeGridEventsProps) => {
  const {
    style,
    className,
    event,
    accessors,
    rtl = false,
    selected = false,
    slotMetrics,
    label,
    continuesPrior,
    continuesAfter,
    getters,
    onClick,
    onDoubleClick,
    isBackgroundEvent = false,
    onKeyPress,
    components: { event: Event, eventWrapper: EventWrapper },
  } = props
  const styledEvents = DayEventLayout.getStyledEvents({
    events,
    accessors,
    slotMetrics,
    minimumStartDifference: Math.ceil((step * timeslots) / 2),
    dayLayoutAlgorithm,
  })

  let title = accessors.title(event)
  let tooltip = accessors.tooltip(event)
  let end = accessors.end(event)
  let start = accessors.start(event)

  let userProps = getters.eventProp(event, start, end, selected)

  const { height, top, width, xOffset } = style

  const eventStyle = {
    ...userProps.style,
    top: stringifyPercent(top),
    height: stringifyPercent(height),
    width: stringifyPercent(width),
    [rtl ? 'right' : 'left']: stringifyPercent(xOffset),
  }

  return (
    <>{ styledEvents.map(({ event, style }, index) => {
      const end = accessors.end(event)
      const start = accessors.start(event)
      const key = accessors.eventId(event) ?? `evt_${idx}`
      let format = 'eventTimeRangeFormat'
      let label

      const startsBeforeDay = slotMetrics.startsBeforeDay(start)
      const startsAfterDay = slotMetrics.startsAfterDay(end)

      if(startsBeforeDay) format = 'eventTimeRangeEndFormat'
      else if(startsAfterDay) format = 'eventTimeRangeStartFormat'

      if(startsBeforeDay && startsAfterDay) label = localizer.messages.allDay
      else label = localizer.format({ start, end }, format)

      const continuesPrior = startsBeforeDay || slotMetrics.startsBefore(start)
      const continuesAfter = startsAfterDay || slotMetrics.startsAfter(end)

      return (
        <EventWrapper type="time" { ...props }>
          <div
            role="button"
            tabIndex={ 0 }
            onClick={ onClick }
            onDoubleClick={ onDoubleClick }
            style={ eventStyle }
            onKeyDown={ onKeyPress }
            title={
              tooltip
                ? (typeof label === 'string' ? label + ': ' : '') + tooltip
                : undefined
            }
            className={ clsx(
              isBackgroundEvent ? 'rbc-background-event' : 'rbc-event',
              className,
              userProps.className,
              {
                'rbc-selected': selected,
                'rbc-event-continues-earlier': continuesPrior,
                'rbc-event-continues-later': continuesAfter,
              }
            ) }
          >
            { [
              <div key="1" className="rbc-event-label">
                { label }
              </div>,
              <div key="2" className="rbc-event-content">
                { Event ? <Event event={ event } title={ title } /> : title }
              </div>,
            ] }
          </div>
        </EventWrapper>
      )
    }) }</>
  )
}

export default TimeGridEvents
