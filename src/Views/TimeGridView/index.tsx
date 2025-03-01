import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as animationFrame from 'dom-helpers/animationFrame'
import memoize from 'memoize-one'
import getPosition from 'dom-helpers/position'
import getWidth from 'dom-helpers/width'
import DayColumn from '@/Views/TimeGridView/DayColumn'
import PopOverlay from '@/components/PopOverlay'
import TimeGridHeader from '@/Views/TimeGridView/TimeGridHeader'
import TimeGridHeaderResources from '@/Views/TimeGridView/TimeGridHeaderResources'
import TimeGutter from '@/TimeGutter'
import { NavigateAction } from '@/utils/constants'
import { inRange, sortEvents } from '@/utils/eventLevels'
import { notify } from '@/utils/helpers'
import Resources from '@/utils/Resources'
import { type DayLayoutAlgorithm } from '@/utils/layout-algorithms/types'
import { CalendarEvent, type Components, type Getters } from '@/types'
import { type DateLocalizer } from '@/localizers'
import { BaseViewProps, createViewComponent, ViewsProps, type ViewComponent } from '@/Views'
import { CalendarProps, useCalendarContext } from '@/components/Calendar'
import clsx from 'clsx'

interface TimeGridViewProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  resourceGroupingLayout?: boolean
  enableAutoScroll?: boolean
  resizable?: boolean
  allDayMaxRows?: number
  showAllEvents?: boolean
  doShowMoreDrillDown?: boolean
  popup?: boolean
  handleDragStart?: () => void
  onShowMore?: (events: TEvent[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
  popupOffset?: number | {
    x: number
    y: number
  }
}

const TimeGridView = <TEvent extends CalendarEvent = CalendarEvent>({
  events,
  backgroundEvents,
  min,
  max,
  getNow,
  scrollToTime,
  accessors,
  components,
  getters,
  getDrilldownView,
  resources,
  resourceGroupingLayout,
  step,
  timeslots,
  range,
  enableAutoScroll,
  showMultiDayTimes,
  rtl,
  resizable,
  width,
  allDayMaxRows,
  selected,
  selectable,
  longPressThreshold,
  onNavigate,
  onSelectSlot,
  onSelectEnd,
  onSelectStart,
  onSelectEvent,
  onShowMore,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,
  dayLayoutAlgorithm,
  showAllEvents,
  doShowMoreDrillDown,
  popup,
  handleDragStart,
  popupOffset,
}: TimeGridViewProps<TEvent>) => {
  const { localizer } = useCalendarContext()

  const [gutterWidth, setGutterWidth] = useState<number | undefined>(undefined)
  const [scrollRatio, setScrollRatio] = useState<number | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [overlay, setOverlay] = useState<Overlay | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const scrollRatioRef = useRef<number>(null)
  const updatingOverflowRef = useRef<boolean>(false)
  const rafHandle = useRef<number>(null)

  const applyScroll = useCallback(() => {
    // If auto-scroll is disabled, we don't actually apply the scroll
    if(scrollRatioRef.current !== null && enableAutoScroll === true) {
      const content = contentRef.current
      content.scrollTop = content.scrollHeight * scrollRatioRef.current
      // Only do this once
      scrollRatioRef.current = null
    }
  }, [enableAutoScroll])

  const checkOverflow = useCallback(() => {
    if(updatingOverflowRef.current) return

    const content = contentRef.current

    if(!content?.scrollHeight) return

    const isOverflowingLocal = content.scrollHeight > content.clientHeight

    if(isOverflowing !== isOverflowingLocal) {
      updatingOverflowRef.current = true

      //TODO: This probably will cause an infinite render
      setIsOverflowing(() => {
        updatingOverflowRef.current = false
        return isOverflowingLocal
      })
    }
  }, [isOverflowing])

  useLayoutEffect(() => {
    checkOverflow()
    applyScroll()
  }, [applyScroll, checkOverflow])

  useEffect(() => {
    if(width === null) {
      measureGutter()
    }

    calculateScroll()
    applyScroll()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      animationFrame.cancel(rafHandle.current)

      if(measureGutterAnimationFrameRequest) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequest)
      }
    }
  }, [width])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if(scrollRef.current) {
      scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  const handleResize = () => {
    animationFrame.cancel(rafHandle.current)
    rafHandle.current = animationFrame.request(checkOverflow)
  }

  const handleKeyPressEvent = (...args: any[]) => {
    clearSelection()
    notify(onKeyPressEvent, args)
  }

  const handleSelectEvent = (...args: any[]) => {
    //cancel any pending selections so only the event click goes through.
    clearSelection()
    notify(onSelectEvent, args)
  }

  const handleDoubleClickEvent = (...args: any[]) => {
    clearSelection()
    notify(onDoubleClickEvent, args)
  }

  const handleShowMore = (events: Event[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => {
    clearSelection()

    if(popup) {
      let position = getPosition(cell, containerRef.current)

      setOverlay({
        date,
        events,
        position: { ...position, width: '200px' },
        target,
      })
    } else if(doShowMoreDrillDown) {
      notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
    }

    notify(onShowMore, [events, date, slot])
  }

  const handleSelectAllDaySlot = (slots: Date[], slotInfo: { action: string, resourceId: string }) => {
    const start = new Date(slots[0])
    const end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)

    notify(onSelectSlot, {
      slots,
      start,
      end,
      action: slotInfo.action,
      resourceId: slotInfo.resourceId,
    })
  }

  const clearSelection = () => {
    clearTimeout(_selectTimer)
    _pendingSelection = []
  }

  const measureGutter = () => {
    if(measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(measureGutterAnimationFrameRequest)
    }
    measureGutterAnimationFrameRequest = window.requestAnimationFrame(
      () => {
        const width = gutterRef?.current
          ? getWidth(gutterRef.current)
          : undefined

        if(width && gutterWidth !== width) {
          setGutterWidth(width)
        }
      }
    )
  }

  const calculateScroll = () => {
    const diffMillis = localizer.diff(
      localizer.merge(scrollToTime, min),
      scrollToTime,
      'milliseconds'
    )
    const totalMillis = localizer.diff(min, max, 'milliseconds')

    scrollRatioRef.current = diffMillis / totalMillis
  }

  const memoizedResources = memoize((resources, accessors) =>
    Resources(resources, accessors)
  )

  width = width || gutterWidth

  const start = range[0]
  const end = range[range.length - 1]

  const slots = range.length

  const allDayEvents = []
  const rangeEvents = []
  const rangeBackgroundEvents = []

  events.forEach((event) => {
    if(inRange(event, start, end, accessors, localizer)) {
      let eStart = accessors.start(event),
          eEnd = accessors.end(event)

      if(
        accessors.allDay(event) ||
        localizer.startAndEndAreDateOnly(eStart, eEnd) ||
        (!showMultiDayTimes && !localizer.isSameDate(eStart, eEnd))
      ) {
        allDayEvents.push(event)
      } else {
        rangeEvents.push(event)
      }
    }
  })

  backgroundEvents.forEach((event) => {
    if(inRange(event, start, end, accessors, localizer)) {
      rangeBackgroundEvents.push(event)
    }
  })

  allDayEvents.sort((a, b) => sortEvents(a, b, accessors, localizer))

  const headerProps = {
    range,
    events: allDayEvents,
    width,
    rtl,
    getNow,
    localizer,
    selected,
    allDayMaxRows: showAllEvents
      ? Infinity
      : allDayMaxRows ?? Infinity,
    resources: memoizedResources(resources, accessors),
    selectable: selectable,
    accessors,
    getters,
    components,
    scrollRef: scrollRef,
    isOverflowing: state.isOverflowing,
    longPressThreshold,
    onSelectSlot: handleSelectAllDaySlot,
    onSelectEvent: handleSelectEvent,
    onShowMore: handleShowMore,
    onDoubleClickEvent: onDoubleClickEvent,
    onKeyPressEvent: onKeyPressEvent,
    onDrillDown: onDrillDown,
    getDrilldownView: getDrilldownView,
    resizable,
  }

  return (
    <div
      ref={ containerRef }
      className={ clsx(
        'rbc-time-view',
        { 'rbc-time-view-resources': resources }
      ) }
    >
      {
        resources && resources.length > 1 && resourceGroupingLayout
          ? <TimeGridHeaderResources { ...headerProps } />
          : <TimeGridHeader { ...headerProps } />
      }
      { popup && renderOverlay() }
      <div
        ref={ contentRef }
        className="rbc-time-content"
        onScroll={ handleScroll }
      >
        <TimeGutter
          date={ start }
          ref={ gutterRef }
          localizer={ localizer }
          min={ localizer.merge(start, min) }
          max={ localizer.merge(start, max) }
          step={ step }
          getNow={ getNow }
          timeslots={ timeslots }
          components={ components }
          className="rbc-time-gutter"
          getters={ getters }
        />
        { renderEvents(
          range,
          rangeEvents,
          rangeBackgroundEvents,
          getNow()
        ) }
      </div>
    </div>
  )
}

export default createViewComponent(TimeGridView, {
  range: (date, { localizer }) => {
    const start = localizer.startOf(date, 'day')
    const end = localizer.endOf(date, 'day')
    return { start, end }
  },
  navigate: (date, action) => {
    switch(action) {
      case 'PREV':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
      case 'NEXT':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      default:
        return date
    }
  },
  title: (date, { localizer }) => localizer.format(date, 'dayHeaderFormat'),
})













const renderDayColumn = (
  date: Date,
  id: string,
  resource: Resource,
  groupedEvents: Map<string, Event[]>,
  groupedBackgroundEvents: Map<string, Event[]>,
  localizer: Localizer,
  accessors,
  components: Components,
  dayLayoutAlgorithm: DayLayoutAlgorithm,
  now: Date,
  ...props: any
) => {
  let { min, max } = props

  let daysEvents = (groupedEvents.get(id) || []).filter((event) =>
    localizer.inRange(
      date,
      accessors.start(event),
      accessors.end(event),
      'day'
    )
  )

  let daysBackgroundEvents = (groupedBackgroundEvents.get(id) || []).filter(
    (event) =>
      localizer.inRange(
        date,
        accessors.start(event),
        accessors.end(event),
        'day'
      )
  )

  return (
    <DayColumn
      { ...props }
      localizer={ localizer }
      min={ localizer.merge(date, min) }
      max={ localizer.merge(date, max) }
      resource={ resource && id }
      components={ components }
      isNow={ localizer.isSameDate(date, now) }
      key={ `${id}-${date}` }
      date={ date }
      events={ daysEvents }
      backgroundEvents={ daysBackgroundEvents }
      dayLayoutAlgorithm={ dayLayoutAlgorithm }
    />
  )
}

const renderResourcesFirst = (
  range: Date[],
  resources: Resource[],
  groupedEvents: Map<string, Event[]>,
  groupedBackgroundEvents: Map<string, Event[]>,
  localizer: DateLocalizer,
  accessors: Accessors,
  now: Date,
  components: Components,
  dayLayoutAlgorithm: DayLayoutAlgorithm
) => {
  return resources.map(([id, resource]) =>
    range.map((date) =>
      renderDayColumn(
        date,
        id,
        resource,
        groupedEvents,
        groupedBackgroundEvents,
        localizer,
        accessors,
        components,
        dayLayoutAlgorithm,
        now
      )
    )
  )
}

const renderRangeFirst = (
  range: Date[],
  resources: Resource[],
  groupedEvents: Map<string, Event[]>,
  groupedBackgroundEvents: Map<string, Event[]>,
  localizer: DateLocalizer,
  accessors: Accessors,
  now: Date,
  components: Components,
  dayLayoutAlgorithm: DayLayoutAlgorithm
) => {
  return range.map((date) => (
    <div style={ { display: 'flex', minHeight: '100%', flex: 1 } } key={ date }>
      { resources.map(([id, resource]) => (
        <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
          { renderDayColumn(
            date,
            id,
            resource,
            groupedEvents,
            groupedBackgroundEvents,
            localizer,
            accessors,
            components,
            dayLayoutAlgorithm,
            now
          ) }
        </div>
      )) }
    </div>
  ))
}

const renderEvents = (
  range: Date[],
  events: Event[],
  backgroundEvents: Event[],
  now: Date,
  ...props: any
) => {
  let {
    accessors,
    localizer,
    resourceGroupingLayout,
    components,
    dayLayoutAlgorithm,
  } = props

  const resources = memoizedResources(props.resources, accessors)
  const groupedEvents = resources.groupEvents(events)
  const groupedBackgroundEvents = resources.groupEvents(backgroundEvents)

  if(!resourceGroupingLayout) {
    return renderResourcesFirst(
      range,
      resources,
      groupedEvents,
      groupedBackgroundEvents,
      localizer,
      accessors,
      now,
      components,
      dayLayoutAlgorithm
    )
  } else {
    return renderRangeFirst(
      range,
      resources,
      groupedEvents,
      groupedBackgroundEvents,
      localizer,
      accessors,
      now,
      components,
      dayLayoutAlgorithm
    )
  }
}


const renderOverlay = (
  setOverlay: (overlay: Overlay | null) => void,
  overlay: Overlay,
  accessors: Accessors,
  localizer: DateLocalizer,
  components: Components,
  getters: Getters,
  selected: Event[],
  popupOffset: number | { x: number, y: number },
  containerRef: React.RefObject<HTMLDivElement>,
  handleKeyPressEvent: (...args: any[]) => void,
  handleSelectEvent: (...args: any[]) => void,
  handleDoubleClickEvent: (...args: any[]) => void,
  handleDragStart: () => void,
) => {
  const onHide = () => setOverlay(null)

  return (
    <PopOverlay
      overlay={ overlay }
      accessors={ accessors }
      localizer={ localizer }
      components={ components }
      getters={ getters }
      selected={ selected }
      popupOffset={ popupOffset }
      ref={ containerRef }
      handleKeyPressEvent={ handleKeyPressEvent }
      handleSelectEvent={ handleSelectEvent }
      handleDoubleClickEvent={ handleDoubleClickEvent }
      handleDragStart={ handleDragStart }
      show={ !!overlay.position }
      overlayDisplay={ setOverlay }
      onHide={ onHide }
    />
  )
}

