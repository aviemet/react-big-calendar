import React from 'react'
import { DateLocalizer } from '@/localizers'
import { CalendarEvent } from '@/types'
import DateContentRow from '@/components/DateContentRow'
import { inRange, sortWeekEvents } from '@/utils/eventLevels'
import { useCalendarContext } from '@/Calendar'
import { Accessors } from '@/utils/accessors'

const eventsForWeek = <TEvent extends CalendarEvent>(
  events: TEvent[],
  start: Date,
  end: Date,
  accessors: Accessors<TEvent>,
  localizer: DateLocalizer
) => events.filter((e) => inRange(e, start, end, accessors, localizer))

interface MonthWeekProps<TEvent extends CalendarEvent = CalendarEvent> {
  week: Date[]
  weekIndex: number
  events: TEvent[]
  showAllEvents?: boolean
  rowLimit: number
  selected?: object
  selectable?: boolean | 'ignoreEvents'
  renderHeader: (props: any) => React.ReactNode
  renderForMeasure?: boolean
  onShowMore: (events: TEvent[], date: Date, cell: HTMLElement, slot: number, target: HTMLElement) => void
  onSelect: (event: TEvent) => void
  onDoubleClick: (event: TEvent) => void
  onKeyPress: (event: TEvent) => void
  onSelectSlot: (range: Date[], slotInfo: any) => void
  longPressThreshold?: number
  resizable?: boolean
  slotRowRef?: React.RefObject<HTMLDivElement>
  getContainer: () => HTMLElement | null
}

const MonthWeek = <TEvent extends CalendarEvent = CalendarEvent>({
  week,
  weekIndex,
  events,
  showAllEvents,
  rowLimit,
  selected,
  selectable,
  renderHeader,
  renderForMeasure,
  onShowMore,
  onSelect,
  onDoubleClick,
  onKeyPress,
  onSelectSlot,
  longPressThreshold,
  resizable,
  slotRowRef,
  getContainer,
}: MonthWeekProps<TEvent>) => {
  const { localizer, accessors } = useCalendarContext()

  const weeksEvents = eventsForWeek(
    [...(events || [])],
    week[0],
    week[week.length - 1],
    accessors,
    localizer
  )

  const sorted = sortWeekEvents(weeksEvents, accessors, localizer)

  return (
    <DateContentRow
      key={ weekIndex }
      ref={ slotRowRef }
      className="rbc-month-row"
      container={ getContainer }
      range={ week }
      events={ sorted }
      maxRows={ showAllEvents ? Infinity : rowLimit }
      selected={ selected }
      selectable={ selectable }
      renderHeader={ renderHeader }
      renderForMeasure={ renderForMeasure }
      onShowMore={ onShowMore }
      onSelect={ onSelect }
      onDoubleClick={ onDoubleClick }
      onKeyPress={ onKeyPress }
      onSelectSlot={ onSelectSlot }
      longPressThreshold={ longPressThreshold }
      resizable={ resizable }
      showAllEvents={ showAllEvents }
    />
  )
}

export default MonthWeek
