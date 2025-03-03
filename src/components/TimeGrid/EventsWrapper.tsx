import { notify } from '@/utils/helpers'
import * as DayEventLayout from '@/utils/DayEventLayout'
import TimeGridEvent from './TimeGridEvent'
import { CalendarEvent, Components, Getters } from '@/types'
import { Accessors } from '@/utils/accessors'
import { isSelected } from '@/utils/eventSelectionHelpers'
import { SlotMetrics } from '@/hooks/useTimeSlotMetrics'
import { useCalendarContext } from '@/Calendar'

interface EventsWrapperProps<TEvent extends CalendarEvent = CalendarEvent> {
  events: TEvent[]
  resource: any
  isBackgroundEvent?: boolean
  rtl: boolean
  selected: any
  accessors: Accessors
  getters: Getters
  components: Components
  step: number
  timeslots: number
  dayLayoutAlgorithm: any
  resizable: boolean
  slotMetrics: SlotMetrics
  onSelectEvent: (args: any) => void
  onDoubleClickEvent: (args: any) => void
  onKeyPressEvent: (args: any) => void
}

const EventsWrapper = <TEvent extends CalendarEvent = CalendarEvent>({
  events,
  resource,
  isBackgroundEvent = false,
  rtl,
  selected,
  accessors,
  getters,
  components,
  step,
  timeslots,
  dayLayoutAlgorithm,
  resizable,
  slotMetrics,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
}: EventsWrapperProps<TEvent>) => {
  const { localizer } = useCalendarContext()

  let styledEvents = DayEventLayout.getStyledEvents({
    events,
    accessors,
    slotMetrics,
    minimumStartDifference: Math.ceil((step * timeslots) / 2),
    dayLayoutAlgorithm,
  })

  const handleClick = (e) => {
    notify(onSelectEvent, {
      ...event,
      ...(resource && {
        sourceResource: resource,
      }),
      ...(isBackgroundEvent && { isBackgroundEvent: true }),
    })
  }

  const handleDoubleClick = (e) => {
    notify(onDoubleClickEvent, event)
  }

  const handleKeyPress = (e) => {
    notify(onKeyPressEvent, event)
  }

  return styledEvents.map(({ event, style }, index) => {
    let end = accessors.end(event)
    let start = accessors.start(event)
    let key = accessors.eventId(event) ?? 'evt_' + index
    let format = 'eventTimeRangeFormat'
    let label

    const startsBeforeDay = slotMetrics.startsBeforeDay(start)
    const startsAfterDay = slotMetrics.startsAfterDay(end)

    if(startsBeforeDay) format = 'eventTimeRangeEndFormat'
    else if(startsAfterDay) format = 'eventTimeRangeStartFormat'

    if(startsBeforeDay && startsAfterDay) label = localizer.messages.allDay
    else label = localizer.format({ start, end }, format)

    let continuesPrior = startsBeforeDay || slotMetrics.startsBefore(start)
    let continuesAfter = startsAfterDay || slotMetrics.startsAfter(end)

    return (
      <TimeGridEvent
        style={ style }
        event={ event }
        label={ label }
        key={ key }
        getters={ getters }
        rtl={ rtl }
        components={ components }
        continuesPrior={ continuesPrior }
        continuesAfter={ continuesAfter }
        accessors={ accessors }
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
