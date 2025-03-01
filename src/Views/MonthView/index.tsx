import React, { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import chunk from 'lodash/chunk'
import { navigate, NavigateAction, View, views } from '@/utils/constants'
import getPosition from 'dom-helpers/position'
import * as animationFrame from 'dom-helpers/animationFrame'
import DateContentRow from '@/components/DateContentRow'
import DateHeader from '@/DateHeader'
import MonthWeek from './MonthWeek'
import MonthHeader from './MonthHeader'
import MonthPopOverlay from './MonthPopOverlay'
import { BaseViewProps, ViewComponent } from '@/Views'
import { DateLocalizer } from '@/localizers'
import { SlotInfo, Components, Getters } from '@/types'
import { useMonthViewState } from './useMonthViewState'

interface MonthViewProps extends BaseViewProps {
  popup?: boolean
  enableAutoScroll?: boolean
  resizable?: boolean
  showAllEvents?: boolean
  doShowMoreDrillDown?: boolean
  handleDragStart?: (event: React.MouseEvent<HTMLElement>) => void
  popupOffset?: number | { x: number, y: number }
  onShowMore?: (events: Event[], date: Date, slot: HTMLElement) => void
  onSelectEvent?: (event: Event) => void
  onDoubleClickEvent?: (event: Event) => void
  onKeyPressEvent?: (event: Event) => void
  localizer: DateLocalizer
  date: Date
  components: Components<Event, object>
  getters: Getters
}

interface DateHeadingProps {
  date: Date
  className?: string
  drilldownView?: View | null
  isOffRange?: boolean
  label?: string
  onDrillDown?: (e: React.MouseEvent<HTMLElement>) => void
}

const MonthView: ViewComponent<MonthViewProps> = (props) => {
  const {
    date,
    events = [],
    localizer,
    selected,
    getters,
    components,
    accessors,
    getNow,
    onSelectEvent,
    onDoubleClickEvent,
    onKeyPressEvent,
    onSelectSlot,
    longPressThreshold,
    selectable,
    rtl,
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

  const containerRef = useRef<HTMLDivElement>(null)
  const slotRowRef = useRef<typeof DateContentRow>(null)
  const pendingSelection = useRef<Date[]>([])

  const [resizeListener, setResizeListener] = useState<number | null>(null)

  const [state, dispatch] = useMonthViewState(props.date)

  useEffect(() => {
    dispatch({
      type: 'SET_MEASURE_LIMIT',
      needLimitMeasure: localizer.neq(date, state.date || new Date(), 'month'),
    })
    dispatch({ type: 'SET_DATE', date })
  }, [date, dispatch, localizer, state.date])

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
    (date: Date, view: View | null | undefined, e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      clearTimeout(resizeListener)
      pendingSelection.current = []
      if(onDrillDown && view) onDrillDown(date, view)
    },
    [onDrillDown, resizeListener]
  )

  const handleSelectEvent = useCallback(
    (event: Event) => {
      clearTimeout(resizeListener)
      pendingSelection.current = []
      if(onSelectEvent) onSelectEvent(event)
    },
    [onSelectEvent, resizeListener]
  )

  const handleDoubleClickEvent = useCallback(
    (event: Event) => {
      clearTimeout(resizeListener)
      pendingSelection.current = []
      if(onDoubleClickEvent) onDoubleClickEvent(event)
    },
    [onDoubleClickEvent, resizeListener]
  )

  const handleKeyPressEvent = useCallback(
    (event: Event) => {
      clearTimeout(resizeListener)
      pendingSelection.current = []
      if(onKeyPressEvent) onKeyPressEvent(event)
    },
    [onKeyPressEvent, resizeListener]
  )

  const handleShowMore = useCallback(
    (events: Event[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => {
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
        const view = typeof drilldownResult === 'string' ? drilldownResult as View : null
        if(view) onDrillDown(date, view)
      }

      if(onShowMore) onShowMore(events, date, slot)
    },
    [resizeListener, popup, doShowMoreDrillDown, onDrillDown, getDrilldownView, onShowMore, dispatch]
  )

  const hideOverlay = useCallback(() => {
    dispatch({ type: 'HIDE_OVERLAY' })
  }, [dispatch])

  const renderDateHeading = useCallback(
    ({ date, className, drilldownView, isOffRange, label, onDrillDown }: DateHeadingProps) => {
      let isCurrent = localizer.isSameDate(date, props.date)
      let DateHeaderComponent = components.month?.dateHeader || DateHeader

      return (
        <div
          className={ clsx(
            className,
            {
              'rbc-off-range': isOffRange,
              'rbc-current': isCurrent,
            }
          ) }
          role="cell"
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
    },
    [localizer, props.date, components.month?.dateHeader, handleHeadingClick]
  )

  const month = localizer.visibleDays(date, localizer)
  const weeks = chunk(month, 7)

  return (
    <div
      className={ clsx('rbc-month-view', className) }
      role="table"
      aria-label="Month View"
      ref={ containerRef }
    >
      <MonthHeader
        dates={ weeks[0] }
        components={ components }
        localizer={ localizer }
      />
      { weeks.map((week, weekIdx) => (
        <MonthWeek
          key={ weekIdx }
          week={ week }
          weekIdx={ weekIdx }
          events={ events }
          date={ date }
          getNow={ getNow }
          showAllEvents={ showAllEvents }
          rowLimit={ state.rowLimit }
          selected={ selected }
          selectable={ selectable }
          components={ components }
          accessors={ accessors }
          getters={ getters }
          localizer={ localizer }
          renderHeader={ renderDateHeading }
          renderForMeasure={ state.needLimitMeasure }
          onShowMore={ handleShowMore }
          onSelect={ handleSelectEvent }
          onDoubleClick={ handleDoubleClickEvent }
          onKeyPress={ handleKeyPressEvent }
          onSelectSlot={ handleSelectSlot }
          longPressThreshold={ longPressThreshold }
          rtl={ rtl }
          resizable={ resizable }
          slotRowRef={ weekIdx === 0 ? slotRowRef : undefined }
          getContainer={ getContainer }
        />
      )) }
      { popup && (
        <MonthPopOverlay
          overlay={ state.overlay }
          accessors={ accessors }
          getters={ getters }
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

MonthView.range = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  let start = localizer.firstVisibleDay(date, localizer)
  let end = localizer.lastVisibleDay(date, localizer)
  return { start, end }
}

MonthView.navigate = (date: Date, action: NavigateAction, { localizer }: { localizer: DateLocalizer }) => {
  switch(action) {
    case navigate.PREVIOUS:
      return localizer.add(date, -1, 'month')
    case navigate.NEXT:
      return localizer.add(date, 1, 'month')
    default:
      return date
  }
}

MonthView.title = (date: Date, { localizer }: { localizer: DateLocalizer }) =>
  localizer.format(date, 'monthHeaderFormat')

export default MonthView
