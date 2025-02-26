import React, { createRef, useRef } from 'react'
import { chunk } from 'lodash-es'
import { navigate, views } from '../../utils/constants'
import { coerceDate, notify } from '../../utils/helpers'
import getPosition from 'dom-helpers/position'
import * as animationFrame from 'dom-helpers/animationFrame'
import PopOverlay from '../../PopOverlay'
import DateContentRow from '../../DateContentRow'
import Header from '../../Header'
import DateHeader from '../../DateHeader'
import { inRange, sortWeekEvents } from '../../utils/eventLevels'
import { BaseViewProps, ViewComponent } from '../../Views'
import { DateLocalizer } from '../../localizers'
import { Components } from '../../types'
import clsx from 'clsx'
import { EventOverlay } from '.'

interface WeekProps {
  week: Date[]
  weekIndex: number
  events: Event[]
  components: Components
  selectable: boolean
  getNow: () => Date
  selected: object
  date: Date
  localizer: DateLocalizer
  longPressThreshold: number
  accessors: object
  getters: object
  showAllEvents: boolean
  popup: boolean
  onShowMore: (events: Event[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
}

const Week = ({ week,
  weekIndex,
  events,
  components,
  selectable,
  getNow,
  selected,
  date,
  localizer,
  longPressThreshold,
  accessors,
  getters,
  showAllEvents,
  onShowMore,
}: WeekProps) => {
  const slotRowRef = useRef<HTMLDivElement>(null)

  const eventsForWeek = (evts: Event[], start: Date, end: Date, accessors: object, localizer: DateLocalizer) => {
    return evts.filter((e) => inRange(e, start, end, accessors, localizer))
  }

  const { needLimitMeasure, rowLimit } = state


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

      container={ getContainer }
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
