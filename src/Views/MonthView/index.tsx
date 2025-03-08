import React, { useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx"
import chunk from "lodash/chunk"
import { navigate } from "@/utils/move"
import getPosition from "dom-helpers/position"
import { BaseViewProps, createViewComponent, ViewName, views } from "@/Views"
import { MonthViewAction, MonthViewState, useMonthViewState } from "./useMonthViewState"
import { useCalendarContext } from "@/components/Calendar"
import { inRange, sortWeekEvents } from "@/utils/eventLevels"
import PopOverlay from "@/components/PopOverlay"
import { CalendarEvent, SlotInfo } from "@/utils/components"
import { DateHeaderProps } from "@/components/DateHeader"
import { useResizeObserver } from "@/hooks/useResizeListener"
import createContext from "@/hooks/createContext"
import DateContentRow from "@/components/DateContentRow"

interface MonthViewContext<TEvent extends CalendarEvent = CalendarEvent> extends MonthViewState<TEvent> {
  setRowLimit: (limit: number) => void
  containerHeight: number
  setMonthState: React.ActionDispatch<[action: MonthViewAction<TEvent>]>
}

const [useMonthViewContext, MonthViewContextProvider] = createContext<MonthViewContext>()
export { useMonthViewContext }

export interface MonthViewProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  showAllEvents?: boolean
  popup?: boolean
  popupOffset?: number | { x: number, y: number }
  enableAutoScroll?: boolean
  resizable?: boolean
  doShowMoreDrillDown?: boolean
  handleDragStart?: (event: React.MouseEvent<HTMLElement>) => void
  onShowMore?: (events: TEvent[], date: Date, slot: number) => void
  onSelectEvent?: (event: TEvent) => void
  onDoubleClickEvent?: (event: TEvent) => void
  onKeyPressEvent?: (event: TEvent) => void
}

const MonthView = <TEvent extends CalendarEvent = CalendarEvent>(
  props: MonthViewProps<TEvent>
) => {
  const {
    events = [],
    selected,
    onSelectEvent,
    onDoubleClickEvent,
    onKeyPressEvent,
    onSelectSlot,
    longPressThreshold,
    selectable,
    resizable,
    showAllEvents,
    popup,
    handleDragStart,
    popupOffset,
    onDrillDown,
    getDrilldownView,
    doShowMoreDrillDown,
    onShowMore,
    className,
  } = props
  const { localizer, date: calendarDate, accessors, components: {
    header: HeaderComponent,
  } } = useCalendarContext()

  const monthContainerRef = useRef<HTMLDivElement>(null)
  const pendingSelection = useRef<Date[]>([])

  const [resizeListener, setResizeListener] = useState<number | null>(null)

  const [state, dispatch] = useMonthViewState<TEvent>(calendarDate)

  const { height: containerHeight } = useResizeObserver(monthContainerRef)

  useEffect(() => {
    dispatch({
      type: "SET_MEASURE_LIMIT",
      needLimitMeasure: localizer.neq(calendarDate, state.date || new Date(), "month"),
    })
    dispatch({ type: "SET_DATE", date: calendarDate })
  }, [calendarDate, state.date, dispatch, localizer])

  const getContainer = useCallback(() => monthContainerRef.current, [])

  const handleSelectSlot = useCallback((range: Date[], slotInfo: SlotInfo) => {
    pendingSelection.current = pendingSelection.current.concat(range)

    clearTimeout(resizeListener)
    setResizeListener(
      window.setTimeout(() => {
        let slots = pendingSelection.current.slice()
        pendingSelection.current = []

        slots.sort((a, b) => +a - +b)

        const start = new Date(slots[0])
        const end = new Date(slots[slots.length - 1])
        end.setDate(slots[slots.length - 1].getDate() + 1)

        onSelectSlot?.({
          slots,
          start,
          end,
          action: slotInfo.action,
          bounds: slotInfo.bounds,
          box: slotInfo.box,
        })
      }, 100)
    )
  }, [onSelectSlot, resizeListener])

  const handleSelectEvent = useCallback((event: TEvent) => {
    clearTimeout(resizeListener)
    pendingSelection.current = []

    onSelectEvent?.(event)
  }, [onSelectEvent, resizeListener])

  const handleDoubleClickEvent = useCallback((event: TEvent) => {
    clearTimeout(resizeListener)
    pendingSelection.current = []

    onDoubleClickEvent?.(event)
  }, [onDoubleClickEvent, resizeListener])

  const handleKeyPressEvent = useCallback((event: TEvent) => {
    clearTimeout(resizeListener)
    pendingSelection.current = []

    onKeyPressEvent?.(event)
  }, [onKeyPressEvent, resizeListener])

  const handleShowMore = useCallback((
    events: TEvent[],
    date: Date,
    cell: HTMLElement,
    slot: number,
    target: HTMLElement
  ) => {
    clearTimeout(resizeListener)
    pendingSelection.current = []

    if(popup) {
      let position = getPosition(cell, monthContainerRef.current)

      dispatch({
        type: "SET_OVERLAY",
        overlay: {
          date,
          events,
          position: { x: position.left, y: position.top },
          end: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          target,
        },
      })
    } else if(doShowMoreDrillDown && onDrillDown && getDrilldownView) {
      const drilldownResult = getDrilldownView(date, views.MONTH, Object.values(views))
      const view = typeof drilldownResult === "string" ? drilldownResult as ViewName : null

      if(view) onDrillDown(date, view)
    }

    onShowMore?.(events, date, slot)
  }, [resizeListener, popup, doShowMoreDrillDown, onDrillDown, getDrilldownView, onShowMore, dispatch])

  const hideOverlay = useCallback(() => {
    dispatch({ type: "HIDE_OVERLAY" })
  }, [dispatch])

  const handleHeadingClick = useCallback((
    date: Date,
    view: DateHeaderProps,
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault()

    clearTimeout(resizeListener)
    pendingSelection.current = []
    if(onDrillDown && view) onDrillDown(date, view)
  }, [onDrillDown, resizeListener])

  const overlayDisplay = useCallback(() => {
    hideOverlay()
  }, [hideOverlay])

  const month = localizer.visibleDays(calendarDate, localizer)
  const weeks = chunk(month, 7)


  return (
    <MonthViewContextProvider value={ {
      setRowLimit: (limit: number) => dispatch({ type: "RESET_MEASURE", rowLimit: limit }),
      containerHeight,
      setMonthState: dispatch,
      ...state,
    } }>
      <div
        className={ clsx("rbc-month-view", className) }
        role="table"
        aria-label="Month View"
        ref={ monthContainerRef }
      >
        <div className="rbc-row rbc-month-header" role="row">
          { localizer.range(weeks[0][0], weeks[0][weeks[0].length - 1], "day").map((day) => (
            <div key={ "header_" + day.toISOString() } className="rbc-header">
              <HeaderComponent
                date={ day }
                label={ localizer.format(day, "weekdayFormat") }
              />
            </div>
          )) }
        </div>
        { weeks.map((week, weekIndex) => {

          const weeksEvents = [...(events || [])].filter(event => inRange(
            event,
            week[0],
            week[week.length - 1],
            accessors,
            localizer
          ))

          const sorted = sortWeekEvents(weeksEvents, accessors, localizer)

          return (
            <DateContentRow
              key={ weekIndex }
              className="rbc-month-row"
              container={ getContainer }
              range={ week }
              events={ sorted }
              maxRows={ showAllEvents ? Infinity : state.rowLimit }
              selected={ selected }
              selectable={ selectable }
              renderForMeasure={ state.needLimitMeasure }
              onShowMore={ handleShowMore }
              onSelect={ handleSelectEvent }
              onDoubleClick={ handleDoubleClickEvent }
              onKeyPress={ handleKeyPressEvent }
              onSelectSlot={ handleSelectSlot }
              onHeadingClick={ handleHeadingClick }
              longPressThreshold={ longPressThreshold }
              resizable={ resizable }
              showAllEvents={ showAllEvents }
            />
          )
        }) }
        { popup && state.overlay && (
          <PopOverlay
            overlay={ state.overlay }
            selected={ selected }
            popupOffset={ popupOffset }
            ref={ monthContainerRef }
            handleSelectEvent={ handleSelectEvent }
            handleDoubleClickEvent={ handleDoubleClickEvent }
            handleKeyPressEvent={ handleKeyPressEvent }
            handleDragStart={ handleDragStart }
            overlayDisplay={ overlayDisplay }
            onHide={ hideOverlay }
          />
        ) }
      </div>
    </MonthViewContextProvider>
  )
}

export default createViewComponent(MonthView, {
  range: (date, { localizer }) => {
    let start = localizer.firstVisibleDay(date, localizer)
    let end = localizer.lastVisibleDay(date, localizer)
    return { start, end }
  },
  navigate: (date, action, { localizer }) => {
    switch(action) {
      case navigate.PREVIOUS:
        return localizer.add(date, -1, "month")
      case navigate.NEXT:
        return localizer.add(date, 1, "month")
      default:
        return date
    }
  },
  title: (date, { localizer }) => localizer.format(date, "monthHeaderFormat"),
})
