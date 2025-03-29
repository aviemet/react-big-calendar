import clsx from "clsx"
import getHeight from "dom-helpers/height"
import qsa from "dom-helpers/querySelectorAll"
import React, { forwardRef, useEffect, useRef } from "react"

import { useCalendarContext } from "@/Calendar"
import { EventRow } from "@/components/EventRow"
import { EventEndingRow } from "@/components/EventRow/EventEndingRow"
import { NoopWrapper } from "@/components/NoopWrapper"
import { ScrollableWeekWrapper } from "@/components/ScrollableWeekWrapper"
import { useDateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { CalendarEvent, SlotInfo } from "@/utils/components"
import { Box } from "@/utils/eventSelectionHelpers"
import { ViewName } from "@/Views"

import { BackgroundCells, SelectSlotInfo } from "./BackgroundCells"
import { Dummy } from "./Dummy"

interface DateContentRowProps<TEvent extends CalendarEvent = CalendarEvent> {
  events: TEvent[]
  range: Date[]
  resizable?: boolean
  resourceId?: string | number
  renderHeader?: boolean
  renderForMeasure?: boolean
  container?: () => HTMLElement
  selected?: TEvent | null
  selectable?: boolean | "ignoreEvents"
  longPressThreshold?: number
  showAllEvents?: boolean
  onShowMore?: (events: TEvent[], date: Date, cell: HTMLElement, slot: number, target: HTMLElement) => void
  onSelectSlot?: (range: Date[], slotInfo: SlotInfo) => void
  onSelect?: (event: TEvent) => void
  onSelectEnd?: (state: {
    startIndex: number
    endIndex: number
    action?: "select" | "click" | "doubleClick"
    bounds?: Box
  }) => void
  onSelectStart?: (box: Box) => void
  onDoubleClick?: (event: TEvent) => void
  onKeyPress?: (event: TEvent) => void
  dayPropGetter?: (date: Date) => { className: string, style: React.CSSProperties }
  onHeadingClick?: (date: Date, drilldownView: ViewName) => void
  isAllDay?: boolean
  minRows?: number
  maxRows?: number
  className?: string
  setRowLimit?: (limit: number) => void
  containerHeight?: number
  needLimitMeasure?: boolean
}

const DateContentRow = forwardRef<HTMLDivElement, DateContentRowProps>((props, ref) => {
  const {
    events,
    range,
    resizable,
    resourceId,
    renderHeader = true,
    renderForMeasure,
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
    onHeadingClick,
    isAllDay,
    minRows = 0,
    maxRows = Infinity,
    className,
    setRowLimit,
    containerHeight,
    needLimitMeasure,
  } = props

  const { date: calendarDate, localizer, getNow, components: {
    dateHeader: DateHeaderComponent,
    weekWrapper: WeekWrapper,
  } } = useCalendarContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const headingRowRef = useRef<HTMLDivElement>(null)
  const eventRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(!setRowLimit
      || !eventRowRef.current
      || !headingRowRef.current
      || !containerRef.current
    ) return

    const eventHeight = getHeight(eventRowRef.current)
    const headingHeight = headingRowRef.current
      ? getHeight(headingRowRef.current)
      : 0
    const eventSpace = getHeight(containerRef.current) - headingHeight

    setRowLimit(Math.max(Math.floor(eventSpace / eventHeight), 1))
  }, [containerHeight, needLimitMeasure, setRowLimit])

  const slotMetrics = useDateSlotMetrics({
    range,
    events,
    maxRows,
    minRows,
  })

  if(renderForMeasure) {
    return (
      <Dummy
        ref={ containerRef }
        showAllEvents={ showAllEvents }
        headingRowRef={ headingRowRef }
        eventRowRef={ eventRowRef }
        range={ range }
      />
    )
  }

  const handleSelectSlot = (slot: SelectSlotInfo) => {
    const selectedRange = range.slice(slot.start, slot.end + 1)
    onSelectSlot?.(selectedRange, {
      start: selectedRange[0],
      end: selectedRange[selectedRange.length - 1],
      action: slot.action,
      bounds: slot.bounds,
      box: slot.box,
      resourceId: slot.resourceId,
      slots: selectedRange,
    })
  }

  const handleShowMore = (slot: number, e: React.MouseEvent<HTMLElement>) => {
    if(!onShowMore) return

    const target = e.currentTarget
    if(!(target instanceof HTMLElement)) return

    const containerElement = typeof ref === "function" ? null : ref?.current
    if(!containerElement) return

    const row = qsa(containerElement, ".rbc-row-bg")[0]
    const cell = row?.children[slot - 1]

    if(!(cell instanceof HTMLElement)) return

    const events = slotMetrics.getEventsForSlot(slot)
    onShowMore(events, range[slot - 1], cell, slot, target)
  }

  const getContainer = () => {
    return container?.() ?? containerRef.current
  }

  const ScrollableWeekComponent = showAllEvents
    ? ScrollableWeekWrapper
    : NoopWrapper

  const eventRowProps = {
    selected,
    onSelect,
    onDoubleClick,
    onKeyPress,
    resourceId,
    slotMetrics,
    resizable,
  }

  return (
    <div className={ clsx(className) } role="rowgroup" ref={ ref }>
      <BackgroundCells
        range={ range }
        selectable={ selectable }
        container={ getContainer }
        onSelectStart={ onSelectStart }
        onSelectEnd={ onSelectEnd }
        onSelectSlot={ handleSelectSlot }
        longPressThreshold={ longPressThreshold }
        resourceId={ resourceId }
      />

      <div
        role="row"
        className={ clsx("rbc-row-content", {
          "rbc-row-content-scrollable": showAllEvents,
        }) }
      >
        <div className="rbc-row" ref={ headingRowRef }>
          { range.map((date, index) => {
            const isOffRange = localizer.neq(date, calendarDate, "month")
            const isCurrent = localizer.isSameDate(date, calendarDate)
            const drilldownView = "day"
            const label = localizer.format(date, "dateFormat")

            return (
              <div
                role="cell"
                key={ `header_${index}` }
                className={ clsx("rbc-date-cell", {
                  "rbc-off-range": isOffRange,
                  "rbc-current": isCurrent,
                  "rbc-now": localizer.isSameDate(date, getNow()),
                }) }
              >
                { renderHeader && (
                  <DateHeaderComponent
                    label={ label }
                    date={ date }
                    drilldownView={ drilldownView }
                    isOffRange={ isOffRange }
                    onDrillDown={ () => onHeadingClick?.(date, drilldownView) }
                    range={ range }
                  />
                ) }
              </div>
            )
          }) }
        </div>

        <ScrollableWeekComponent>
          <WeekWrapper
            isAllDay={ isAllDay }
            slotMetrics={ slotMetrics }
            resourceId={ resourceId }
            { ...eventRowProps }
          >
            { slotMetrics.levels.map((segs, index) => (
              <EventRow
                key={ index }
                segments={ segs }
                slotMetrics={ slotMetrics }
                { ...eventRowProps }
              />
            )) }
            { !!slotMetrics.extra.length && (
              <EventEndingRow
                key="extra"
                segments={ slotMetrics.extra }
                onShowMore={ handleShowMore }
                slotMetrics={ slotMetrics }
                { ...eventRowProps }
              />
            ) }
          </WeekWrapper>
        </ScrollableWeekComponent>
      </div>
    </div>
  )
})

DateContentRow.displayName = "DateContentRow"

export { DateContentRow }
