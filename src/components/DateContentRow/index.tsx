import React, { forwardRef, useEffect, useRef } from "react"
import getHeight from "dom-helpers/height"
import qsa from "dom-helpers/querySelectorAll"
import { BackgroundCells } from "./BackgroundCells"
import { EventRow } from "@/components/EventRow"
import { EventEndingRow } from "@/components/EventRow/EventEndingRow"
import { NoopWrapper } from "@/components/NoopWrapper"
import { ScrollableWeekWrapper } from "@/components/ScrollableWeekWrapper"
import { Dummy } from "./Dummy"
import clsx from "clsx"
import { useCalendarContext } from "@/Calendar"
import { useDateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { CalendarEvent, SlotInfo } from "@/utils/components"
import { ViewHeaderProps } from "../Header"

interface DateContentRowProps<TEvent extends CalendarEvent = CalendarEvent> {
  events: TEvent[]
  range: Date[]
  resizable?: boolean
  resourceId?: any
  renderHeader?: boolean
  renderForMeasure?: boolean
  container?: () => HTMLElement
  selected?: object
  selectable?: boolean | "ignoreEvents"
  longPressThreshold?: number
  onShowMore?: (events: TEvent[], date: Date, cell: HTMLElement, slot: number, target: HTMLElement) => void
  showAllEvents?: boolean
  onSelectSlot?: (range: Date[], slot: SlotInfo) => void
  onSelect?: (event: TEvent) => void
  onSelectEnd?: (event: TEvent) => void
  onSelectStart?: (event: TEvent) => void
  onDoubleClick?: (event: TEvent) => void
  onKeyPress?: (event: TEvent) => void
  dayPropGetter?: (date: Date) => { className: string, style: React.CSSProperties }
  onHeadingClick?: (date: Date, drilldownView: ViewHeaderProps, e: React.MouseEvent<HTMLElement>) => void
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
  } = props
  const { date: calendarDate, localizer, getNow, rtl, components: {
    dateHeader: DateHeaderComponent,
    weekWrapper: WeekWrapper,
  } } = useCalendarContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const headingRowRef = useRef<HTMLDivElement>(null)
  const eventRowRef = useRef<HTMLDivElement>(null)

  const { setRowLimit, containerHeight, needLimitMeasure } = props
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
  }, [containerHeight, needLimitMeasure, props, setRowLimit])

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
        { ...props }
      />
    )
  }

  const handleSelectSlot = (slot) => {
    onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
  }

  const handleShowMore = (slot, target) => {
    let row = qsa(containerRef.current, ".rbc-row-bg")[0]

    let cell
    if(row) cell = row.children[slot - 1]

    let events = slotMetrics.getEventsForSlot(slot)
    onShowMore?.(events, range[slot - 1], cell, slot, target)
  }

  const getContainer = () => {
    const { container } = props
    return container ? container() : containerRef.current
  }

  let ScrollableWeekComponent = showAllEvents
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
    <div className={ clsx(className) } role="rowgroup" ref={ containerRef }>
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
        <div className="rbc-row " ref={ headingRowRef }>
          { range.map((date, index) => {
            let isOffRange = localizer.neq(date, calendarDate, "month")
            let isCurrent = localizer.isSameDate(date, calendarDate)
            let drilldownView = "day"// getDrilldownView(date)
            let label = localizer.format(date, "dateFormat")

            return <>
              <div
                role="cell"
                key={ `header_${index}` }
                className={ clsx("rbc-date-cell", {
                  "rbc-off-range": isOffRange,
                  "rbc-current": isCurrent,
                  "rbc-now": localizer.isSameDate(date, getNow()),
                }) }
              >
                { renderHeader && <DateHeaderComponent
                  label={ label || localizer.format(date, "dateFormat") }
                  date={ date }
                  drilldownView={ drilldownView }
                  isOffRange={ isOffRange }
                  onDrillDown={ (e) => onHeadingClick?.(date, drilldownView, e) }
                  range={ range }
                /> }
              </div>
            </>
          }) }
        </div>

        <ScrollableWeekComponent>
          <WeekWrapper isAllDay={ isAllDay } { ...eventRowProps } rtl={ rtl }>
            { slotMetrics.levels.map((segs, index) => (
              <EventRow
                weekIndex={ index }
                segments={ segs }
                { ...eventRowProps }
              />
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

export { DateContentRow }
