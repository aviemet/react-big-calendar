import React from 'react'
import { BaseViewProps } from '@/Views'
import { DateLocalizer } from '@/localizers'
import { Components } from '@/types'
import DateContentRow from '@/components/DateContentRow'
import { inRange, sortWeekEvents } from '@/utils/eventLevels'

interface MonthWeekProps {
  week: Date[]
  weekIdx: number
  events: Event[]
  date: Date
  getNow: () => Date
  showAllEvents?: boolean
  rowLimit: number
  selected?: object
  selectable?: boolean | 'ignoreEvents'
  components: Components<Event, object>
  accessors: BaseViewProps['accessors']
  getters: BaseViewProps['getters']
  localizer: DateLocalizer
  renderHeader: (props: any) => React.ReactNode
  renderForMeasure?: boolean
  onShowMore: (events: Event[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
  onSelect: (event: Event) => void
  onDoubleClick: (event: Event) => void
  onKeyPress: (event: Event) => void
  onSelectSlot: (range: Date[], slotInfo: any) => void
  longPressThreshold?: number
  rtl?: boolean
  resizable?: boolean
  slotRowRef?: React.RefObject<typeof DateContentRow>
  getContainer: () => HTMLElement | null
}

const eventsForWeek = (
  events: Event[],
  start: Date,
  end: Date,
  accessors: BaseViewProps['accessors'],
  localizer: DateLocalizer
) => events.filter((e) => inRange(e, start, end, accessors, localizer))

const MonthWeek: React.FC<MonthWeekProps> = ({
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
}) => {
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
