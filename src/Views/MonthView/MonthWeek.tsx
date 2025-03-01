import React from 'react'
import { BaseViewProps } from '@/Views'
import { DateLocalizer } from '@/localizers'
import { Components, CalendarEvent } from '@/types'
import DateContentRow from '@/components/DateContentRow'
import { inRange, sortWeekEvents } from '@/utils/eventLevels'

const eventsForWeek = <TEvent extends CalendarEvent>(
  events: TEvent[],
  start: Date,
  end: Date,
  accessors: BaseViewProps<TEvent>['accessors'],
  localizer: DateLocalizer
) => events.filter((e) => inRange(e, start, end, accessors, localizer))

interface MonthWeekProps<TEvent extends CalendarEvent = CalendarEvent> {
  week: Date[]
  weekIdx: number
  events: TEvent[]
  date: Date
  getNow: () => Date
  showAllEvents?: boolean
  rowLimit: number
  selected?: object
  selectable?: boolean | 'ignoreEvents'
  components: Components<TEvent, object>
  accessors: BaseViewProps<TEvent>['accessors']
  getters: BaseViewProps<TEvent>['getters']
  localizer: DateLocalizer
  renderHeader: (props: any) => React.ReactNode
  renderForMeasure?: boolean
  onShowMore: (events: TEvent[], date: Date, cell: HTMLElement, slot: number, target: HTMLElement) => void
  onSelect: (event: TEvent) => void
  onDoubleClick: (event: TEvent) => void
  onKeyPress: (event: TEvent) => void
  onSelectSlot: (range: Date[], slotInfo: any) => void
  longPressThreshold?: number
  rtl?: boolean
  resizable?: boolean
  slotRowRef?: React.RefObject<HTMLDivElement>
  getContainer: () => HTMLElement | null
}

const MonthWeek = <TEvent extends CalendarEvent = CalendarEvent>({
  week,
  weekIdx,
  events,
  date,
  getNow,
  showAllEvents,
  rowLimit,
  selected,
  selectable,
  components,
  accessors,
  getters,
  localizer,
  renderHeader,
  renderForMeasure,
  onShowMore,
  onSelect,
  onDoubleClick,
  onKeyPress,
  onSelectSlot,
  longPressThreshold,
  rtl,
  resizable,
  slotRowRef,
  getContainer,
}: MonthWeekProps<TEvent>) => {
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
      key={ weekIdx }
      ref={ slotRowRef }
      container={ getContainer }
      className="rbc-month-row"
      getNow={ getNow }
      date={ date }
      range={ week }
      events={ sorted }
      maxRows={ showAllEvents ? Infinity : rowLimit }
      selected={ selected }
      selectable={ selectable }
      components={ components }
      accessors={ accessors }
      getters={ getters }
      localizer={ localizer }
      renderHeader={ renderHeader }
      renderForMeasure={ renderForMeasure }
      onShowMore={ onShowMore }
      onSelect={ onSelect }
      onDoubleClick={ onDoubleClick }
      onKeyPress={ onKeyPress }
      onSelectSlot={ onSelectSlot }
      longPressThreshold={ longPressThreshold }
      rtl={ rtl }
      resizable={ resizable }
      showAllEvents={ showAllEvents }
    />
  )
}

export default MonthWeek
