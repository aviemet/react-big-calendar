import React, { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import chunk from 'lodash/chunk'
import { navigate } from '@/utils/constants'
import getPosition from 'dom-helpers/position'
import * as animationFrame from 'dom-helpers/animationFrame'
import DateHeader, { DateHeaderProps } from '@/DateHeader'
import MonthWeek from './MonthWeek'
import MonthHeader from './MonthHeader'
import MonthPopOverlay from './MonthPopOverlay'
import { BaseViewProps, createViewComponent, ViewName, views } from '@/Views'
import { SlotInfo, CalendarEvent } from '@/types'
import { useMonthViewState } from './useMonthViewState'
import { useCalendarContext } from '@/Calendar'

export interface MonthViewProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  showAllEvents?: boolean
  popup?: boolean
  popupOffset?: number | { x: number, y: number }
  enableAutoScroll?: boolean
  resizable?: boolean
  doShowMoreDrillDown?: boolean
  handleDragStart?: (event: React.MouseEvent<HTMLElement>) => void
  onShowMore?: (events: TEvent[], date: Date, slot: HTMLElement) => void
  onSelectEvent?: (event: TEvent) => void
  onDoubleClickEvent?: (event: TEvent) => void
  onKeyPressEvent?: (event: TEvent) => void
}

const MonthView = <TEvent extends CalendarEvent = CalendarEvent>(props: MonthViewProps<TEvent>) => {
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
  const { localizer, components, date: calendarDate } = useCalendarContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const slotRowRef = useRef<HTMLDivElement>(null)
  const pendingSelection = useRef<Date[]>([])

  const [resizeListener, setResizeListener] = useState<number | null>(null)

  const [state, dispatch] = useMonthViewState(calendarDate)

  useEffect(() => {
    dispatch({
      type: 'SET_MEASURE_LIMIT',
      needLimitMeasure: localizer.neq(calendarDate, state.date || new Date(), 'month'),
    })
    dispatch({ type: 'SET_DATE', date: calendarDate })
  }, [calendarDate, dispatch, localizer, state.date])

  useEffect(() => {
    let running = false

    const handleResize = () => {
      if(!running) {
        animationFrame.request(() => {
          running = false
          dispatch({ type: 'SET_MEASURE_LIMIT', needLimitMeasure: true })
        })
      }
    }

    window.addEventListener('resize', handleResize, false)
    return () => window.removeEventListener('resize', handleResize, false)
  }, [dispatch])

  useEffect(() => {
    if(state.needLimitMeasure && slotRowRef.current) {
      dispatch({ type: 'RESET_MEASURE' })
    }
  }, [dispatch, state.needLimitMeasure])

  const getContainer = useCallback(() => containerRef.current, [])

  const handleSelectSlot = useCallback(
    (range: Date[], slotInfo: SlotInfo) => {
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
    },
    [onSelectSlot, resizeListener]
  )

  const handleHeadingClick = useCallback(
    (date: Date, view: ViewName | null | undefined, e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      clearTimeout(resizeListener)
      pendingSelection.current = []
      if(onDrillDown && view) onDrillDown(date, view)
    },
    [onDrillDown, resizeListener]
  )

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
      let position = getPosition(cell, containerRef.current)

      dispatch({
        type: 'SET_OVERLAY',
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
      const view = typeof drilldownResult === 'string' ? drilldownResult as ViewName : null

      if(view) onDrillDown(date, view)
    }

    onShowMore?.(events, date, slot)
  }, [resizeListener, popup, doShowMoreDrillDown, onDrillDown, getDrilldownView, onShowMore, dispatch])

  const hideOverlay = useCallback(() => {
    dispatch({ type: 'HIDE_OVERLAY' })
  }, [dispatch])

  const renderDateHeading = useCallback((
    {
      date,
      className,
      drilldownView,
      isOffRange,
      label,
      onDrillDown,
    }: DateHeaderProps
  ) => {
    let isCurrent = localizer.isSameDate(date, calendarDate)
    let DateHeaderComponent = components.month?.dateHeader || DateHeader

    return (
      <div
        role="cell"
        className={ clsx(className, {
          'rbc-off-range': isOffRange,
          'rbc-current': isCurrent,
        }) }
      >
        <DateHeaderComponent
          label={ label || localizer.format(date, 'dateFormat') }
          date={ date }
          drilldownView={ drilldownView }
          isOffRange={ isOffRange }
          onDrillDown={ (e: React.MouseEvent<HTMLElement>) => handleHeadingClick(date, drilldownView, e) }
        />
      </div>
    )
  }, [localizer, calendarDate, components.month?.dateHeader, handleHeadingClick])

  const month = localizer.visibleDays(calendarDate, localizer)
  const weeks = chunk(month, 7)

  return (
    <div
      className={ clsx('rbc-month-view', className) }
      role="table"
      aria-label="Month View"
      ref={ containerRef }
    >
      <MonthHeader dates={ weeks[0] } />
      { weeks.map((week, weekIndex) => (
        <MonthWeek
          key={ weekIndex }
          week={ week }
          weekIndex={ weekIndex }
          events={ events }
          showAllEvents={ showAllEvents }
          rowLimit={ state.rowLimit }
          selected={ selected }
          selectable={ selectable }
          renderHeader={ renderDateHeading }
          renderForMeasure={ state.needLimitMeasure }
          onShowMore={ handleShowMore }
          onSelect={ handleSelectEvent }
          onDoubleClick={ handleDoubleClickEvent }
          onKeyPress={ handleKeyPressEvent }
          onSelectSlot={ handleSelectSlot }
          longPressThreshold={ longPressThreshold }
          resizable={ resizable }
          slotRowRef={ weekIndex === 0 ? slotRowRef : undefined }
          getContainer={ getContainer }
        />
      )) }
      { popup && (
        <MonthPopOverlay
          overlay={ state.overlay }
          selected={ selected }
          popupOffset={ popupOffset }
          containerRef={ containerRef }
          handleSelectEvent={ handleSelectEvent }
          handleDoubleClickEvent={ handleDoubleClickEvent }
          handleKeyPressEvent={ handleKeyPressEvent }
          handleDragStart={ handleDragStart }
          onHide={ hideOverlay }
        />
      ) }
    </div>
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
        return localizer.add(date, -1, 'month')
      case navigate.NEXT:
        return localizer.add(date, 1, 'month')
      default:
        return date
    }
  },
  title: (date, { localizer }) => localizer.format(date, 'monthHeaderFormat'),
})
