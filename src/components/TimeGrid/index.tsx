import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import * as animationFrame from 'dom-helpers/animationFrame'
import getPosition from 'dom-helpers/position'
import getWidth from 'dom-helpers/width'
import DayColumn from './DayColumn'
import PopOverlay from '../PopOverlay'
import TimeGridHeader from './TimeGridHeader'
import TimeGridHeaderResources from './TimeGridHeaderResources'
import TimeGutter from './TimeGutter'
import { inRange, sortEvents } from '@/utils/eventLevels'
import { notify } from '@/utils/helpers'
import { CalendarEvent } from '@/types'
import { BaseViewProps } from '@/Views'
import { useCalendarContext } from '@/Calendar'
import Resources, { Resource } from '@/utils/Resources'
import { Accessors } from '@/utils/accessors'
import { Overlay } from 'react-overlays'

interface TimeGridProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
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

const TimeGrid = <TEvent extends CalendarEvent = CalendarEvent>({
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
}: TimeGridProps<TEvent>) => {
  const { localizer } = useCalendarContext()

  const [gutterWidth, setGutterWidth] = useState<number | undefined>(undefined)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [overlay, setOverlay] = useState<typeof Overlay | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRatioRef = useRef<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const updatingOverflowRef = useRef<boolean>(false)
  const rafHandleRef = useRef<number>(null)
  const measureGutterAnimationFrameRequestRef = useRef<number>(null)

  const checkOverflow = useCallback(() => {
    if(updatingOverflowRef.current === true) return

    const content = contentRef.current

    if(!content?.scrollHeight) return

    if(isOverflowing !== content.scrollHeight > content.clientHeight) {
      updatingOverflowRef.current = true
      setIsOverflowing(false)
    }
  }, [])

  const handleResize = useCallback(() => {
    animationFrame.cancel(rafHandleRef.current)
    rafHandleRef.current = animationFrame.request(checkOverflow)
  }, [checkOverflow])


  const measureGutter = useCallback(() => {
    if(measureGutterAnimationFrameRequestRef.current) {
      window.cancelAnimationFrame(measureGutterAnimationFrameRequestRef.current)
    }
    measureGutterAnimationFrameRequestRef.current = window.requestAnimationFrame(
      () => {
        const width = gutterRef?.current
          ? getWidth(gutterRef.current)
          : undefined

        if(width && width !== gutterWidth) {
          setGutterWidth(width)
        }
      }
    )
  }, [gutterWidth])

  useLayoutEffect(() => {
    checkOverflow()
  }, [])

  useEffect(() => {
    if(width === null) {
      measureGutter()
    }

    const diffMillis = localizer.diff(
      localizer.merge(scrollToTime, min),
      scrollToTime,
      'milliseconds'
    )
    const totalMillis = localizer.diff(min, max, 'milliseconds')

    scrollRatioRef.current = diffMillis / totalMillis

    // If auto-scroll is disabled, we don't actually apply the scroll
    if(scrollRatioRef.current !== null && enableAutoScroll === true) {
      const content = contentRef.current
      content.scrollTop = content.scrollHeight * scrollRatioRef.current
      // Only do this once
      scrollRatioRef.current = null
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      animationFrame.cancel(rafHandleRef.current)

      if(measureGutterAnimationFrameRequestRef.current) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequestRef.current)
      }
    }
  }, [enableAutoScroll, handleResize, localizer, max, measureGutter, min, scrollToTime, width])


  const memoizedResources = useCallback((resources: Resource[], accessors: Accessors) =>
    Resources(resources, accessors)
  , [resources, accessors])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if(scrollRef.current) {
      scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  // componentDidUpdate() {
  //   applyScroll()
  // }


  const handleSelectEvent = (...args) => {
    //cancel any pending selections so only the event click goes through.
    // clearSelection()
    notify(onSelectEvent, args)
  }


  const handleShowMore = (events: TEvent[], date: Date, cell, slot, target) => {
    // clearSelection()

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

  const handleSelectAllDaySlot = (slots, slotInfo) => {
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

  const overlayDisplay = () => {
    setOverlay(null)
  }

  // const clearSelection = () => {
  //   clearTimeout and _pendingSelection were never used or defined elsewhere
  //   clearTimeout(_selectTimer)
  //   _pendingSelection = []
  // }



  // render()

  // Pretty sure this was totally unused
  // slots = range.length

  const groupAndSortEvents = useCallback(() => {
    const start = range[0]
    const end = range[range.length - 1]

    const allDayEvents: TEvent[] = []
    const rangeEvents: TEvent[] = []
    const rangeBackgroundEvents: TEvent[] = []

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

    return {
      allDayEvents,
      rangeEvents,
      rangeBackgroundEvents,
    }
  }, [events, backgroundEvents, range, accessors, localizer])

  const { allDayEvents, rangeEvents, rangeBackgroundEvents } = groupAndSortEvents()

  const headerProps = {
    range,
    events: allDayEvents,
    width: width || gutterWidth,
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
    isOverflowing: isOverflowing,
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
      { popup && <OverlayWrapper
        overlay={ overlay }
        accessors={ accessors }
        localizer={ localizer }
        components={ components }
        getters={ getters }
        selected={ selected }
        popupOffset={ popupOffset }
        handleDragStart={ handleDragStart }
        show={ !!overlay.position }
        overlayDisplay={ overlayDisplay }
        onHide={ () => setOverlay(null) }
      /> }
      <div
        ref={ contentRef }
        className="rbc-time-content"
        onScroll={ handleScroll }
      >
        <TimeGutter
          ref={ gutterRef }
          min={ localizer.merge(range[0], min) }
          max={ localizer.merge(range[0], max) }
          step={ step }
          getNow={ getNow }
          timeslots={ timeslots }
          components={ components }
          getters={ getters }
        />
        <EventsWrapper
          range={ range }
          events={ rangeEvents }
          backgroundEvents={ rangeBackgroundEvents }
          now={ getNow() }
          resources={ memoizedResources(resources, accessors) }
        />
      </div>
    </div>
  )
}

export default TimeGrid

























const DayColumnWrapper = (props) => {
  const {
    date,
    id,
    resource,
    groupedEvents,
    groupedBackgroundEvents,
    localizer,
    accessors,
    components,
    dayLayoutAlgorithm,
    now,
  } = props

  const daysEvents = (groupedEvents.get(id) || []).filter((event) =>
    localizer.inRange(
      date,
      accessors.start(event),
      accessors.end(event),
      'day'
    )
  )

  const daysBackgroundEvents = (groupedBackgroundEvents.get(id) || []).filter(
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

const ResourcesFirst = ({
  range,
  resources,
  ...props
}) => {
  return resources.map(([id, resource]) =>
    range.map((date) =>
      <DayColumnWrapper
        resource={ resource }
        { ...props }
      />
    )
  )
}

const RangeFirst = ({
  range,
  resources,
  accessors,
  ...props
}) => {
  return range.map((date) => (
    <div style={ { display: 'flex', minHeight: '100%', flex: 1 } } key={ date }>
      { resources.map(([id, resource]) => (
        <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
          <DayColumnWrapper
            date={ date }
            resource={ resource }
            accessors={ accessors }
            { ...props }
          />
        </div>
      )) }
    </div>
  ))
}


interface EventsWrapperProps {
  events: CalendarEvent[]
  resources: Resource[]
  accessors: Accessors
  backgroundEvents: CalendarEvent[]
  resourceGroupingLayout: boolean
}

const EventsWrapper = ({
  events,
  resources,
  accessors,
  backgroundEvents,
  ...props
}: EventsWrapperProps) => {

  const localResources = memoizedResources(resources, accessors)
  const groupedEvents = localResources.groupEvents(events)
  const groupedBackgroundEvents = localResources.groupEvents(backgroundEvents)

  if(!resourceGroupingLayout) {
    return <ResourcesFirst
      resources={ localResources }
      groupedEvents={ groupedEvents }
      groupedBackgroundEvents={ groupedBackgroundEvents }
      accessors={ accessors }
      { ...props }
    />
  } else {
    return <RangeFirst
      resources={ localResources }
      groupedEvents={ groupedEvents }
      groupedBackgroundEvents={ groupedBackgroundEvents }
      accessors={ accessors }
      { ...props }
    />
  }
}



interface OverlayWrapperProps {
  overlay: Overlay
  accessors: Accessors
  localizer: Localizer
  components: Components
  getters: Getters
  selected: Selected
  popupOffset: PopupOffset
  handleDragStart: HandleDragStart
  overlayDisplay: OverlayDisplay
  onHide: () => void
  onKeyPressEvent: (...args: any[]) => void
  onSelectEvent: (...args: any[]) => void
  onDoubleClickEvent: (...args: any[]) => void
}

const OverlayWrapper = ({
  overlay = {},
  accessors,
  localizer,
  components,
  getters,
  selected,
  popupOffset,
  handleDragStart,
  overlayDisplay,
  onHide,
  onKeyPressEvent,
  onSelectEvent,
  onDoubleClickEvent,
}: OverlayWrapperProps) => {
  const handleKeyPressEvent = (...args) => {
    // clearSelection()
    notify(onKeyPressEvent, args)
  }

  const handleDoubleClickEvent = (...args) => {
    // clearSelection()
    notify(onDoubleClickEvent, args)
  }

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
      overlayDisplay={ overlayDisplay }
      onHide={ onHide }
    />
  )
}
