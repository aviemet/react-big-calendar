import { useCalendarContext } from '@/Calendar'
import { CalendarEvent } from '@/utils/components'
import clsx from 'clsx'

function stringifyPercent(v: string | number) {
  return typeof v === 'string' ? v : v + '%'
}

interface TimeGridEventProps<TEvent extends CalendarEvent = CalendarEvent> {
  style: { top: number, height: number, width: number, xOffset: number }
  className: string
  event: TEvent
  selected: any
  label: React.ReactNode
  continuesPrior: boolean
  continuesAfter: boolean
  onClick: () => void
  onDoubleClick: () => void
  isBackgroundEvent: boolean
  onKeyPress: () => void
}

function TimeGridEvent(props: TimeGridEventProps) {
  const {
    style,
    className,
    event,
    selected,
    label,
    continuesPrior,
    continuesAfter,
    onClick,
    onDoubleClick,
    isBackgroundEvent,
    onKeyPress,
  } = props
  const { accessors, getters, rtl, components: {
    event: Event,
    eventWrapper: EventWrapper,
  } } = useCalendarContext()

  let title = accessors.title(event)
  let tooltip = accessors.tooltip(event)
  let end = accessors.end(event)
  let start = accessors.start(event)

  let userProps = getters.eventProp(event, start, end, selected)

  const inner = [
    <div key="1" className="rbc-event-label">
      { label }
    </div>,
    <div key="2" className="rbc-event-content">
      { Event ? <Event event={ event } title={ title } /> : title }
    </div>,
  ]

  const { height, top, width, xOffset } = style

  const eventStyle = {
    ...userProps.style,
    top: stringifyPercent(top),
    height: stringifyPercent(height),
    width: stringifyPercent(width),
    [rtl ? 'right' : 'left']: stringifyPercent(xOffset),
  }

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
        { inner }
      </div>
    </EventWrapper>
  )
}

export default TimeGridEvent
