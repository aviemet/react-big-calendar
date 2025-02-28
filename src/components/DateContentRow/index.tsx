import React, { useRef } from 'react'
import getHeight from 'dom-helpers/height'
import qsa from 'dom-helpers/querySelectorAll'
import BackgroundCells from './BackgroundCells'
import EventRow from '@/components/EventRow'
import EventEndingRow from '@/components/EventRow/EventEndingRow'
import NoopWrapper from '@/NoopWrapper'
import ScrollableWeekWrapper from '@/ScrollableWeekWrapper'
import * as DateSlotMetrics from '@/utils/DateSlotMetrics'
import { useCalendarContext } from '../Calendar'
import Dummy from './Dummy'
import clsx from 'clsx'

interface DateContentRowProps {
  date?: Date
  events: Event[]
  range: Date[]
  rtl?: boolean
  resizable?: boolean
  resourceId?: any

  renderForMeasure?: boolean
  renderHeader?: (props: { date: Date, key: string, className: string }) => React.ReactNode

  container?: () => HTMLElement
  selected?: object
  selectable?: boolean | 'ignoreEvents'
  longPressThreshold?: number
  onShowMore?: (events: Event[], date: Date, cell: HTMLElement, slot: number, target: HTMLElement) => void
  showAllEvents?: boolean
  onSelectSlot?: (range: Date[], slot: { start: number, end: number }) => void
  onSelect?: (event: Event) => void
  onSelectEnd?: (event: Event) => void
  onSelectStart?: (event: Event) => void
  onDoubleClick?: (event: Event) => void
  onKeyPress?: (event: Event) => void
  dayPropGetter?: (date: Date) => { className: string, style: React.CSSProperties }
  getNow: () => Date
  isAllDay?: boolean
  accessors: object
  getters: object
  minRows?: number
  maxRows?: number

  className?: string
}

const DateContentRow = (props: DateContentRowProps) => {
  const {
    date,
    events,
    range,
    rtl,
    resizable,
    resourceId,
    renderForMeasure,
    renderHeader,
    container,
    selected,
    selectable,
    longPressThreshold,
    onShowMore,
    showAllEvents,
    onSelectSlot,
    onSelect,
    onSelectEnd,
    onSelectStart,
    onDoubleClick,
    onKeyPress,
    dayPropGetter,
    getNow,
    isAllDay,
    accessors,
    getters,
    minRows = 0,
    maxRows = Infinity,
    className,
  } = props
  const { localizer, components } = useCalendarContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const headingRowRef = useRef<HTMLDivElement>(null)
  const eventRowRef = useRef<HTMLDivElement>(null)

  const slotMetricsRef = useRef(DateSlotMetrics.getSlotMetrics())

  const handleSelectSlot = (slot) => {
    onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
  }

  const handleShowMore = (slot, target) => {
    let metrics = slotMetricsRef.current(props)
    let row = qsa(containerRef.current, '.rbc-row-bg')[0]

    let cell
    if(row) cell = row.children[slot - 1]

    let events = metrics.getEventsForSlot(slot)
    onShowMore(events, range[slot - 1], cell, slot, target)
  }

  const getContainer = () => {
    const { container } = props
    return container ? container() : containerRef.current
  }
  /* Guessing this only gets called on the dummyRow */
  const getRowLimit = () => {
    const eventHeight = getHeight(eventRowRef.current)
    const headingHeight = headingRowRef?.current
      ? getHeight(headingRowRef.current)
      : 0
    const eventSpace = getHeight(containerRef.current) - headingHeight

    return Math.max(Math.floor(eventSpace / eventHeight), 1)
  }

  const renderHeadingCell = (date, index) => {
    return renderHeader({
      date,
      key: `header_${index}`,
      className: clsx(
        'rbc-date-cell',
        localizer.isSameDate(date, getNow()) && 'rbc-now'
      ),
    })
  }


  if(renderForMeasure) {
    return (
      <Dummy
        ref={ containerRef }
        renderHeader={ renderHeader }
        showAllEvents={ showAllEvents }
        headingRowRef={ headingRowRef }
        eventRowRef={ eventRowRef }
        renderHeadingCell={ renderHeadingCell }
        { ...props }
      />
    )
  }

  const metrics = slotMetricsRef.current(props)
  const { levels, extra } = metrics

  let ScrollableWeekComponent = showAllEvents
    ? ScrollableWeekWrapper
    : NoopWrapper
  let WeekWrapper = components.weekWrapper

  const eventRowProps = {
    selected,
    accessors,
    getters,
    localizer,
    components,
    onSelect,
    onDoubleClick,
    onKeyPress,
    resourceId,
    slotMetrics: metrics,
    resizable,
  }

  return (
    <div className={ clsx(className) } role="rowgroup" ref={ containerRef }>
      <BackgroundCells
        localizer={ localizer }
        date={ date }
        getNow={ getNow }
        rtl={ rtl }
        range={ range }
        selectable={ selectable }
        container={ getContainer }
        getters={ getters }
        onSelectStart={ onSelectStart }
        onSelectEnd={ onSelectEnd }
        onSelectSlot={ handleSelectSlot }
        components={ components }
        longPressThreshold={ longPressThreshold }
        resourceId={ resourceId }
      />

      <div
        className={ clsx(
          'rbc-row-content',
          showAllEvents && 'rbc-row-content-scrollable'
        ) }
        role="row"
      >
        { renderHeader && (
          <div className="rbc-row " ref={ headingRowRef }>
            { range.map(renderHeadingCell) }
          </div>
        ) }
        <ScrollableWeekComponent>
          <WeekWrapper isAllDay={ isAllDay } { ...eventRowProps } rtl={ props.rtl }>
            { levels.map((segs, Index) => (
              <EventRow key={ Index } segments={ segs } { ...eventRowProps } />
            )) }
            { !!extra.length && (
              <EventEndingRow
                segments={ extra }
                onShowMore={ handleShowMore }
                { ...eventRowProps }
              />
            ) }
          </WeekWrapper>
        </ScrollableWeekComponent>
      </div>
    </div>
  )
}


export default DateContentRow
