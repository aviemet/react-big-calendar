import React, { forwardRef, useRef } from 'react'
import getHeight from 'dom-helpers/height'
import qsa from 'dom-helpers/querySelectorAll'
import BackgroundCells from './BackgroundCells'
import EventRow from '@/components/EventRow'
import EventEndingRow from '@/components/EventRow/EventEndingRow'
import NoopWrapper from '@/NoopWrapper'
import ScrollableWeekWrapper from '@/ScrollableWeekWrapper'
import Dummy from './Dummy'
import clsx from 'clsx'
import { CalendarEvent, Components } from '@/types'
import { useCalendarContext } from '@/Calendar'
import { useDateSlotMetrics } from '@/hooks/useDateSlotMetrics'

interface DateContentRowProps {
  date?: Date
  events: CalendarEvent[]
  range: Date[]
  rtl?: boolean
  resizable?: boolean
  resourceId?: any
  components: Components
  renderForMeasure?: boolean
  renderHeader?: (props: { date: Date, key: string, className: string }) => React.ReactNode

  container?: () => HTMLElement
  selected?: object
  selectable?: boolean | 'ignoreEvents'
  longPressThreshold?: number
  onShowMore?: (events: CalendarEvent[], date: Date, cell: HTMLElement, slot: number, target: HTMLElement) => void
  showAllEvents?: boolean
  onSelectSlot?: (range: Date[], slot: { start: number, end: number }) => void
  onSelect?: (event: CalendarEvent) => void
  onSelectEnd?: (event: CalendarEvent) => void
  onSelectStart?: (event: CalendarEvent) => void
  onDoubleClick?: (event: CalendarEvent) => void
  onKeyPress?: (event: CalendarEvent) => void
  dayPropGetter?: (date: Date) => { className: string, style: React.CSSProperties }
  getNow: () => Date
  isAllDay?: boolean
  accessors: object
  getters: object
  minRows?: number
  maxRows?: number

  className?: string
}

const DateContentRow = forwardRef((props: DateContentRowProps, ref: React.RefObject<HTMLDivElement>) => {
  const {
    date,
    events,
    range,
    rtl,
    resizable,
    resourceId,
    renderForMeasure,
    renderHeader,
    components,
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

  const { localizer } = useCalendarContext()
  const slotMetrics = useDateSlotMetrics({
    range,
    events,
    maxRows,
    minRows,
    accessors,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const headingRowRef = useRef<HTMLDivElement>(null)
  const eventRowRef = useRef<HTMLDivElement>(null)

  const handleSelectSlot = (slot) => {
    onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
  }

  const handleShowMore = (slot, target) => {
    let row = qsa(containerRef.current, '.rbc-row-bg')[0]

    let cell
    if(row) cell = row.children[slot - 1]

    let events = slotMetrics.getEventsForSlot(slot)
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

  const renderHeadingCell = (date: Date, index: number) => {
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

  let ScrollableWeekComponent = showAllEvents
    ? ScrollableWeekWrapper
    : NoopWrapper
  let WeekWrapper = components.weekWrapper

  const eventRowProps = {
    selected,
    accessors,
    getters,
    components,
    onSelect,
    onDoubleClick,
    onKeyPress,
    resourceId,
    slotMetrics: slotMetrics,
    resizable,
  }

  return (
    <div className={ clsx(className) } role="rowgroup" ref={ containerRef }>
      <BackgroundCells
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
        ref={ ref }
        role="row"
        className={ clsx('rbc-row-content', {
          'rbc-row-content-scrollable': showAllEvents,
        }) }
      >
        { renderHeader && (
          <div className="rbc-row " ref={ headingRowRef }>
            { range.map(renderHeadingCell) }
          </div>
        ) }
        <ScrollableWeekComponent>
          <WeekWrapper isAllDay={ isAllDay } { ...eventRowProps } rtl={ props.rtl }>
            { slotMetrics.levels.map((segs, Index) => (
              <EventRow key={ Index } segments={ segs } { ...eventRowProps } />
            )) }
            { !!slotMetrics.extra.length && (
              <EventEndingRow
                segments={ slotMetrics.extra }
                onShowMore={ handleShowMore }
                { ...eventRowProps }
              />
            ) }
          </WeekWrapper>
        </ScrollableWeekComponent>
      </div>
    </div>
  )
})


export default DateContentRow
