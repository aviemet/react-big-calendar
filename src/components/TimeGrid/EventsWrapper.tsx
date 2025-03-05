import * as DayEventLayout from '@/utils/DayEventLayout'
import TimeGridEvent from './TimeGridEvent'
import { isSelected } from '@/utils/eventSelectionHelpers'
import { SlotMetrics } from '@/hooks/useTimeSlotMetrics'
import { CalendarProps, useCalendarContext } from '@/Calendar'
import { Resource } from '@/utils/Resources'
import { DayLayoutAlgorithm } from '@/utils/layout-algorithms/types'
import { CalendarEvent } from '@/utils/components'

interface EventsWrapperProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  events: TEvent[]
  resource: TResource
  isBackgroundEvent?: boolean
  selected: any
  step: number
  timeslots: number
  dayLayoutAlgorithm: DayLayoutAlgorithm
  resizable: boolean
  slotMetrics: SlotMetrics
  onSelectEvent: CalendarProps['onSelectEvent']
  onDoubleClickEvent: CalendarProps['onDoubleClickEvent']
  onKeyPressEvent: CalendarProps['onKeyPressEvent']
}

const EventsWrapper = <TEvent extends CalendarEvent = CalendarEvent>({
  events,
  resource,
  isBackgroundEvent = false,
  selected,
  step,
  timeslots,
  dayLayoutAlgorithm,
  resizable,
  slotMetrics,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
}: EventsWrapperProps<TEvent>) => {
  const { localizer, accessors } = useCalendarContext()

  let styledEvents = DayEventLayout.getStyledEvents({
    events,
    accessors,
    slotMetrics,
    minimumStartDifference: Math.ceil((step * timeslots) / 2),
    dayLayoutAlgorithm,
  })

  const handleClick = (event) => {
    onSelectEvent?.(event, {
      ...(resource && {
        sourceResource: resource,
      }),
      ...(isBackgroundEvent && { isBackgroundEvent: true }),
    })
  }

  const handleDoubleClick = (event) => {
    onDoubleClickEvent?.(event)
  }

  const handleKeyPress = (event) => {
    onKeyPressEvent?.(event)
  }

  return styledEvents.map(({ event, style }, index) => {
    const end = accessors.end(event)
    const start = accessors.start(event)

    const startsBeforeDay = slotMetrics.startsBeforeDay(start)
    const startsAfterDay = slotMetrics.startsAfterDay(end)

    let format
    if(startsBeforeDay) {
      format = 'eventTimeRangeEndFormat'
    } else if(startsAfterDay) {
      format = 'eventTimeRangeStartFormat'
    } else {
      format = 'eventTimeRangeFormat'
    }

    const key = accessors.eventId(event) ?? 'evt_' + index
    const label = (startsBeforeDay && startsAfterDay) ? localizer.messages.allDay : localizer.format({ start, end }, format)

    let continuesPrior = startsBeforeDay || slotMetrics.startsBefore(start)
    let continuesAfter = startsAfterDay || slotMetrics.startsAfter(end)

    return (
      <TimeGridEvent
        style={ style }
        event={ event }
        label={ label }
        key={ key }
        continuesPrior={ continuesPrior }
        continuesAfter={ continuesAfter }
        resource={ resource }
        selected={ isSelected(event, selected) }
        onClick={ handleClick }
        onDoubleClick={ handleDoubleClick }
        isBackgroundEvent={ isBackgroundEvent }
        onKeyPress={ handleKeyPress }
        resizable={ resizable }
      />
    )
  })
}

export default EventsWrapper
