import React, { useRef } from 'react'
import { useCalendarContext } from '@/components/Calendar'
import DateContentRow from '@/components/DateContentRow'
import { inRange, sortWeekEvents } from '@/utils/eventLevels'
import { Selectable } from '@/Views'
import { DateLocalizer } from '@/localizers'
import clsx from 'clsx'
import { Accessors, Getters } from '@/types'

interface WeekProps {
  week: Date[]
  weekIndex: number
  events: Event[]
  selectable?: Selectable | undefined
  getNow: () => Date
  selected: Event
  date: Date
  longPressThreshold: number
  accessors: Accessors
  getters: Getters
  showAllEvents: boolean
  popup: boolean
  onShowMore: (events: Event[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
  containerRef: React.RefObject<HTMLDivElement>
}

const Week = ({ week,
  weekIndex,
  events,
  selectable,
  getNow,
  selected,
  date,
  longPressThreshold,
  accessors,
  getters,
  showAllEvents,
  onShowMore,
  containerRef,
}: WeekProps) => {
  const { localizer, components } = useCalendarContext()

  const slotRowRef = useRef<HTMLDivElement>(null)

  const eventsForWeek = (evts: Event[], start: Date, end: Date, accessors: object, localizer: DateLocalizer) => {
    return evts.filter((e) => inRange(e, start, end, accessors, localizer))
  }

  // const { needLimitMeasure, rowLimit } = state

  // let's not mutate props
  const weeksEvents = eventsForWeek(
    [...events],
    week[0],
    week[week.length - 1],
    accessors,
    localizer
  )

  const sorted = sortWeekEvents(weeksEvents, accessors, localizer)

  return (
    <DateContentRow
      key={ weekIndex }
      ref={ weekIndex === 0 ? slotRowRef : undefined }
      className={ clsx("rbc-month-row") }

      container={ containerRef.current }
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
      onShowMore={ onShowMore }
      onSelect={ handleSelectEvent }
      onDoubleClick={ handleDoubleClickEvent }
      onKeyPress={ handleKeyPressEvent }
      onSelectSlot={ handleSelectSlot }
      longPressThreshold={ longPressThreshold }
      rtl={ props.rtl }
      resizable={ props.resizable }
      showAllEvents={ showAllEvents }

      renderHeader={ readerDateHeading }
      renderForMeasure={ needLimitMeasure }
    />
  )
}

export default Week
