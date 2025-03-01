import React from 'react'
import EventWrapper from '@/addons/dragAndDrop/EventWrapper'
import { useCalendarContext } from '../Calendar'
import { CalendarEvent, Getters } from '@/types'
import clsx from 'clsx'
import { Accessors } from '@/utils/accessors'

interface EventCellProps {
  event: CalendarEvent
  slotStart: Date
  slotEnd: Date

  resizable: boolean
  selected: boolean
  isAllDay: boolean
  continuesPrior: boolean
  continuesAfter: boolean

  accessors: Accessors
  components: { event: CalendarEvent, eventWrapper: EventWrapper }
  getters: Getters

  onSelect: (event: CalendarEvent, e: React.MouseEvent<HTMLElement>) => void
  onDoubleClick: (event: CalendarEvent, e: React.MouseEvent<HTMLElement>) => void
  onKeyPress: (event: CalendarEvent, e: React.KeyboardEvent<HTMLElement>) => void

  children?: Function
  style?: React.CSSProperties
  className?: string
}


const EventCell = ({
  style,
  className,
  event,
  selected,
  isAllDay,
  onSelect,
  onDoubleClick,
  onKeyPress,
  continuesPrior,
  continuesAfter,
  accessors,
  getters,
  children,
  components: { event: Event, eventWrapper: EventWrapper },
  slotStart,
  slotEnd,
  ...props
}: EventCellProps) => {
  const { localizer } = useCalendarContext()

  let title = accessors.title(event)
  let tooltip = accessors.tooltip(event)
  let end = accessors.end(event)
  let start = accessors.start(event)
  let allDay = accessors.allDay(event)

  let showAsAllDay =
      isAllDay ||
      allDay ||
      localizer.diff(start, localizer.ceil(end, 'day'), 'day') > 1

  let userProps = getters.eventProp(event, start, end, selected)

  const content = (
    <div className="rbc-event-content" title={ tooltip || undefined }>
      { Event
        ? (
          <Event
            event={ event }
            continuesPrior={ continuesPrior }
            continuesAfter={ continuesAfter }
            title={ title }
            isAllDay={ allDay }
            localizer={ localizer }
            slotStart={ slotStart }
            slotEnd={ slotEnd }
          />
        )
        : (
          title
        ) }
    </div>
  )

  return (
    <EventWrapper { ...props } type="date">
      <div
        { ...props }
        style={ { ...userProps.style, ...style } }
        className={ clsx('rbc-event', className, userProps.className, {
          'rbc-selected': selected,
          'rbc-event-allday': showAsAllDay,
          'rbc-event-continues-prior': continuesPrior,
          'rbc-event-continues-after': continuesAfter,
        }) }
        onClick={ (e) => onSelect && onSelect(event, e) }
        onDoubleClick={ (e) => onDoubleClick && onDoubleClick(event, e) }
        onKeyDown={ (e) => onKeyPress && onKeyPress(event, e) }
      >
        { typeof children === 'function' ? children(content) : content }
      </div>
    </EventWrapper>
  )

}

export default EventCell
