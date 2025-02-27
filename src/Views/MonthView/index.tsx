import { useRef, useState } from 'react'
import { chunk } from 'lodash-es'
import { navigate, View, views } from '@/utils/constants'
import { coerceDate, notify } from '@/utils/helpers'
import getPosition from 'dom-helpers/position'
import * as animationFrame from 'dom-helpers/animationFrame'
import PopOverlay from '@/components/PopOverlay'
import DateContentRow from '@/components/DateContentRow'
import Header from '@/Header'
import DateHeader from '@/DateHeader'
import { inRange, sortWeekEvents } from '@/utils/eventLevels'
import { BaseViewProps, ViewComponent } from '@/Views'
import clsx from 'clsx'
import Week from './Week'
import { useCalendarContext } from '@/components/Calendar'
import Headers from './Headers'

export type EventOverlay = {
  date: Date
  events: Event[]
  position: {
    top: number
    left: number
  }
  target: HTMLElement
}

interface MonthViewProps extends BaseViewProps {
  doShowMoreDrillDown: boolean
  onShowMore: (events: Event[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
  onDrillDown: (date: Date, view: View) => void
  enableAutoScroll: boolean
  resizable: boolean
  showAllEvents: boolean
  popup: boolean
  popupOffset: number
  handleDragStart: (event: React.MouseEvent<HTMLElement>) => void
}

const MonthView: ViewComponent<MonthViewProps> = ({ className, ...props }) => {
  const {
    events,
    min,
    max,
    step,
    scrollToTime,
    enableAutoScroll,
    rtl,
    width,
    accessors,
    components,
    getters,
    selected,
    selectable,
    longPressThreshold,
    onNavigate,
    onSelectSlot,
    onSelectEvent,
    onDoubleClickEvent,
    onKeyPressEvent,
    onDrillDown,
    onShowMore,
    getDrilldownView,
    getNow,
    doShowMoreDrillDown,
    showAllEvents,
    popup,
    handleDragStart,
    popupOffset,
  } = props
  const date = coerceDate(props.date || getNow())

  const { localizer } = useCalendarContext()

  const [overlay, setOverlay] = useState<EventOverlay>(null)
  const [pendingSelection, setPendingSelection] = useState<Event[]>([])

  const containerRef = useRef<HTMLDivElement>(null)

  const clearSelection = () => {
    clearTimeout(_selectTimer)
    _pendingSelection = []
  }

  const handleShowMore = (events: Event[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => {
    //cancel any pending selections so only the event click goes through.
    clearSelection()

    if(popup) {
      let position = getPosition(cell, containerRef.current)

      setOverlay({ date, events, position, target })
    } else if(doShowMoreDrillDown) {
      notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
    }

    notify(onShowMore, [events, date, slot])
  }

  // const needLimitMeasure = localizer.neq(date, state.date, 'month')

  const month = localizer.visibleDays(coerceDate(date || getNow()), localizer)
  const weeks = chunk(month, 7)

  return (
    <div
      className={ clsx('rbc-month-view', className) }
      role="table"
      aria-label="Month View"
      ref={ containerRef }
    >
      <Headers row={ weeks[0] } />

      { weeks.map(week => <Week
        key={ week[0].toISOString() }
        week={ week }
        weekIndex={ 0 }
        events={ events }
        selectable={ selectable }
        getNow={ getNow }
        selected={ selected }
        date={ date }
        longPressThreshold={ longPressThreshold }
        accessors={ accessors }
        getters={ getters }
        showAllEvents={ showAllEvents }
        popup={ popup }
        onShowMore={ handleShowMore }
        containerRef={ containerRef }
      /> ) }

      { popup && <PopOverlay
        ref={ containerRef }
        overlay={ overlay }
        accessors={ accessors }
        getters={ getters }
        selected={ selected }
        popupOffset={ popupOffset }
        handleKeyPressEvent={ handleKeyPressEvent }
        handleSelectEvent={ handleSelectEvent }
        handleDoubleClickEvent={ handleDoubleClickEvent }
        handleDragStart={ handleDragStart }
        show={ !!overlay.position }
        overlayDisplay={ overlayDisplay }
        onHide={ () => setOverlay(false) }
      /> }

    </div>
  )
}

MonthView.range = (date, { localizer }) => {
  let start = localizer.firstVisibleDay(date, localizer)
  let end = localizer.lastVisibleDay(date, localizer)
  return { start, end }
}

MonthView.navigate = (date, action, { localizer }) => {
  switch(action) {
    case navigate.PREVIOUS:
      return localizer.add(date, -1, 'month')

    case navigate.NEXT:
      return localizer.add(date, 1, 'month')

    default:
      return date
  }
}

MonthView.title = (date, { localizer }) => localizer.format(date, 'monthHeaderFormat')

export default MonthView
