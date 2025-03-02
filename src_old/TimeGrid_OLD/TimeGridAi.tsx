import clsx from 'clsx'
import * as animationFrame from 'dom-helpers/animationFrame'
import getPosition from 'dom-helpers/position'
import getWidth from 'dom-helpers/width'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DayColumn from '../../../src_old/DayColumn'
import PopOverlay from '../../../src_old/PopOverlay'
import TimeGridHeader from '../../../src_old/TimeGridHeader'
import TimeGridHeaderResources from '../../../src_old/TimeGridHeaderResources'
import TimeGutter from '../../../src_old/TimeGutter'
import { views } from '../../../src_old/utils/constants'
import { inRange } from '../../../src_old/utils/eventLevels'
import { notify } from '../../../src_old/utils/helpers'
import Resources from '../../../src_old/utils/Resources'
import { CalendarEvent } from '../../types/index'
import { BaseViewProps } from '../../Views/index'
import { DateLocalizer } from '../../localizers'

export interface TimeGridProps<TEvent extends CalendarEvent = CalendarEvent> extends BaseViewProps<TEvent> {
  enableAutoScroll: boolean
  resizable: boolean
  allDayMaxRows: number
  showAllEvents: boolean
  doShowMoreDrillDown: boolean
  popup: boolean
  popupOffset: number | { x: number, y: number }
  resourceGroupingLayout: false
  localizer: DateLocalizer
  onShowMore: (events: TEvent[], date: Date, slot: any) => void
  handleDragStart: (event: TEvent) => void
  // onNavigate: (date: Date, view: string, action: string) => void // Different signature in second object
  // onSelectEnd: () => void // Different signature in second object
  // onSelectStart: () => void // Different signature in second object
  // onSelectEvent: (event: TEvent) => void // Different signature in second object
  // onDoubleClickEvent: (event: TEvent) => void // Different signature in second object
  // onKeyPressEvent: (event: TEvent) => void // Different signature in second object
  // getDrilldownView: (date: Date) => string | null // Different signature in second object
}

interface PopOverlayProps<TEvent extends CalendarEvent = CalendarEvent> {
  overlay: {
    date: Date
    events: TEvent[]
    position: {
      width: string
      [key: string]: any
    }
    target: HTMLElement
  }
  accessors: TimeGridProps['accessors']
  localizer: TimeGridProps['localizer']
  components: TimeGridProps['components']
  getters: TimeGridProps['getters']
  selected?: TEvent
  popupOffset?: number | { x: number, y: number }
  handleKeyPressEvent: (...args: any[]) => void
  handleSelectEvent: (...args: any[]) => void
  handleDoubleClickEvent: (...args: any[]) => void
  handleDragStart?: (event: TEvent) => void
  show: boolean
  overlayDisplay: () => void
  onHide: () => void
}

interface TimeGutterProps {
  date: Date
  localizer: TimeGridProps['localizer']
  min: Date
  max: Date
  step: number
  getNow: () => Date
  timeslots: number
  components: TimeGridProps['components']
  className: string
  getters: TimeGridProps['getters']
}

export interface Resource {
  id: string | number
  [key: string]: any
}

export interface TimeGridEvent extends CalendarEvent {
  resourceId?: string | number
}

const defaultProps = {
  step: 30,
  timeslots: 2,
  resourceGroupingLayout: false,
} as const

const DayColumnWrapper = <TEvent extends CalendarEvent = CalendarEvent>({
  date,
  id,
  resource,
  groupedEvents,
  groupedBackgroundEvents,
  min,
  max,
  components,
  getNow,
  accessors,
  localizer,
  dayLayoutAlgorithm,
  resizable,
  step,
  timeslots,
  selected,
  selectable,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
}: {
  date: Date
  id: string | number
  resource: Resource
  groupedEvents: Map<string | number, TEvent[]>
  groupedBackgroundEvents: Map<string | number, TEvent[]>
  min: Date
  max: Date
  components: TimeGridProps['components']
  getNow: () => Date
  accessors: TimeGridProps['accessors']
  localizer: TimeGridProps['localizer']
  dayLayoutAlgorithm: any
  resizable: boolean
  step: number
  timeslots: number
  selected?: TEvent
  selectable?: boolean | 'ignoreEvents'
  onSelectSlot?: (slotInfo: any) => void
  onSelectEvent?: (event: TEvent) => void
  onDoubleClickEvent?: (event: TEvent) => void
  onKeyPressEvent?: (event: TEvent) => void
}) => {
  const daysEvents = (groupedEvents.get(id) || []).filter((event) =>
    localizer.inRange(date, accessors.start(event), accessors.end(event), 'day')
  )

  const daysBackgroundEvents = (groupedBackgroundEvents.get(id) || []).filter(
    (event) =>
      localizer.inRange(date, accessors.start(event), accessors.end(event), 'day')
  )

  return (
    <DayColumn
      { ...{
        min: localizer.merge(date, min),
        max: localizer.merge(date, max),
        resource: resource && id,
        components,
        isNow: localizer.isSameDate(date, getNow()),
        key: `${id}-${date.toISOString()}`,
        date,
        events: daysEvents,
        backgroundEvents: daysBackgroundEvents,
        dayLayoutAlgorithm,
        accessors,
        localizer,
        resizable,
        step,
        timeslots,
        selected,
        selectable,
        onSelectSlot,
        onSelectEvent,
        onDoubleClickEvent,
        onKeyPressEvent,
      } }
    />
  )
}

const EventsContainer = <TEvent extends CalendarEvent = CalendarEvent>({
  range,
  rangeEvents,
  rangeBackgroundEvents,
  now,
  resourceList,
  resourceGroupingLayout,
  min,
  max,
  components,
  getNow,
  accessors,
  localizer,
  dayLayoutAlgorithm,
  resizable,
  step,
  timeslots,
  selected,
  selectable,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
}: {
  range: Date[]
  rangeEvents: TEvent[]
  rangeBackgroundEvents: TEvent[]
  now: Date
  resourceList: any
  resourceGroupingLayout: boolean
  min: Date
  max: Date
  components: TimeGridProps['components']
  getNow: () => Date
  accessors: TimeGridProps['accessors']
  localizer: TimeGridProps['localizer']
  dayLayoutAlgorithm: any
  resizable: boolean
  step: number
  timeslots: number
  selected?: TEvent
  selectable?: boolean | 'ignoreEvents'
  onSelectSlot?: (slotInfo: any) => void
  onSelectEvent?: (event: TEvent) => void
  onDoubleClickEvent?: (event: TEvent) => void
  onKeyPressEvent?: (event: TEvent) => void
}) => {
  const groupedEvents = resourceList.groupEvents(rangeEvents)
  const groupedBackgroundEvents = resourceList.groupEvents(rangeBackgroundEvents)

  if(!resourceGroupingLayout) {
    return (
      <>
        { resourceList.map(([id, resource]) =>
          range.map((date) => (
            <DayColumnWrapper
              key={ `${id}-${date.toISOString()}` }
              date={ date }
              id={ id }
              resource={ resource }
              groupedEvents={ groupedEvents }
              groupedBackgroundEvents={ groupedBackgroundEvents }
              min={ min }
              max={ max }
              components={ components }
              getNow={ getNow }
              accessors={ accessors }
              localizer={ localizer }
              dayLayoutAlgorithm={ dayLayoutAlgorithm }
              resizable={ resizable }
              step={ step }
              timeslots={ timeslots }
              selected={ selected }
              selectable={ selectable }
              onSelectSlot={ onSelectSlot }
              onSelectEvent={ onSelectEvent }
              onDoubleClickEvent={ onDoubleClickEvent }
              onKeyPressEvent={ onKeyPressEvent }
            />
          ))
        ) }
      </>
    )
  }

  return (
    <>
      { range.map((date) => (
        <div style={ { display: 'flex', minHeight: '100%', flex: 1 } } key={ date.toISOString() }>
          { resourceList.map(([id, resource]) => (
            <div style={ { flex: 1 } } key={ accessors.resourceId?.(resource) }>
              <DayColumnWrapper
                date={ date }
                id={ id }
                resource={ resource }
                groupedEvents={ groupedEvents }
                groupedBackgroundEvents={ groupedBackgroundEvents }
                min={ min }
                max={ max }
                components={ components }
                getNow={ getNow }
                accessors={ accessors }
                localizer={ localizer }
                dayLayoutAlgorithm={ dayLayoutAlgorithm }
                resizable={ resizable }
                step={ step }
                timeslots={ timeslots }
                selected={ selected }
                selectable={ selectable }
                onSelectSlot={ onSelectSlot }
                onSelectEvent={ onSelectEvent }
                onDoubleClickEvent={ onDoubleClickEvent }
                onKeyPressEvent={ onKeyPressEvent }
              />
            </div>
          )) }
        </div>
      )) }
    </>
  )
}

export interface PopupProps {
  overlay: {
    date: Date
    events: CalendarEvent[]
    position: { [key: string]: any, width: string }
    target: HTMLElement
  }
  accessors: any
  localizer: DateLocalizer
  components: any
  getters: any
  selectable: boolean
  selected: any
  onHide: () => void
}

export interface TEvent extends CalendarEvent {
  resourceId?: string | number
}

const TimeGrid = <TEvent extends CalendarEvent = CalendarEvent>({
  events,
  backgroundEvents,
  resources = [],
  resourceGroupingLayout = defaultProps.resourceGroupingLayout,
  step = defaultProps.step,
  timeslots = defaultProps.timeslots,
  range,
  min,
  max,
  getNow,
  scrollToTime,
  enableAutoScroll,
  showMultiDayTimes,
  rtl,
  resizable,
  width: initialWidth,
  accessors,
  components,
  getters,
  localizer,
  allDayMaxRows,
  selected,
  selectable,
  longPressThreshold,
  onSelectSlot,
  onSelectEvent,
  onShowMore,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,
  getDrilldownView,
  dayLayoutAlgorithm,
  showAllEvents,
  doShowMoreDrillDown,
  popup,
  handleDragStart,
  popupOffset,
}: TimeGridProps<TEvent>) => {
  const [gutterWidth, setGutterWidth] = useState<number | undefined>(undefined)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [overlay, setOverlay] = useState<PopOverlayProps['overlay'] | null>(null)
  const [slots, setSlots] = useState<number | undefined>(undefined)

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const rafHandleRef = useRef<number>(null)
  const measureGutterAnimationFrameRequestRef = useRef<number>(null)
  const scrollRatioRef = useRef<number | null>(null)
  const updatingOverflowRef = useRef(false)

  const resourceList = useMemo(() => {
    const resourceAccessors = {
      ...accessors,
      resource: (event: TEvent) => event.resourceId,
      resourceId: (resource: Resource) => resource.id,
    }
    // @ts-ignore - Resources function needs proper typing in a future update
    const result = Resources(resources || [], resourceAccessors)

    return {
      map: result.map,
      groupEvents: (events: TEvent[]) => result.groupEvents(events) as Map<string | number, TEvent[]>,
    }
  }, [resources, accessors])

  const checkOverflow = useCallback(() => {
    if(updatingOverflowRef.current) return

    const content = contentRef.current
    if(!content?.scrollHeight) return

    const isOverflowing = content.scrollHeight > content.clientHeight

    if(isOverflowing !== isOverflowing) {
      updatingOverflowRef.current = true
      setIsOverflowing(isOverflowing)
      updatingOverflowRef.current = false
    }
  }, [isOverflowing])

  const measureGutter = useCallback(() => {
    if(measureGutterAnimationFrameRequestRef.current) {
      window.cancelAnimationFrame(measureGutterAnimationFrameRequestRef.current)
    }

    measureGutterAnimationFrameRequestRef.current = window.requestAnimationFrame(() => {
      const width = gutterRef.current ? getWidth(gutterRef.current) : undefined
      if(width && gutterWidth !== width) {
        setGutterWidth(width)
      }
    })
  }, [gutterWidth])

  const calculateScroll = useCallback(() => {
    const diffMillis = localizer.diff(
      localizer.merge(scrollToTime, min),
      scrollToTime,
      'milliseconds'
    )
    const totalMillis = localizer.diff(min, max, 'milliseconds')
    scrollRatioRef.current = diffMillis / totalMillis
  }, [scrollToTime, min, max, localizer])

  const applyScroll = useCallback(() => {
    if(scrollRatioRef.current !== null && enableAutoScroll === true) {
      const content = contentRef.current
      if(content) {
        content.scrollTop = content.scrollHeight * scrollRatioRef.current
        scrollRatioRef.current = null
      }
    }
  }, [enableAutoScroll])

  const handleResize = useCallback(() => {
    if(rafHandleRef.current) {
      animationFrame.cancel(rafHandleRef.current)
    }
    rafHandleRef.current = animationFrame.request(checkOverflow)
  }, [checkOverflow])

  useEffect(() => {
    if(initialWidth === null) {
      measureGutter()
    }
    calculateScroll()
    applyScroll()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if(rafHandleRef.current) {
        animationFrame.cancel(rafHandleRef.current)
      }
      if(measureGutterAnimationFrameRequestRef.current) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequestRef.current)
      }
    }
  }, [
    initialWidth,
    measureGutter,
    calculateScroll,
    applyScroll,
    handleResize,
  ])

  useEffect(() => {
    checkOverflow()
  })

  useEffect(() => {
    applyScroll()
  })

  const handleSelectEvent = useCallback(
    (...args: any[]) => {
      notify(onSelectEvent, args)
    },
    [onSelectEvent]
  )

  const handleDoubleClickEvent = useCallback(
    (...args: any[]) => {
      notify(onDoubleClickEvent, args)
    },
    [onDoubleClickEvent]
  )

  const handleKeyPressEvent = useCallback(
    (...args: any[]) => {
      notify(onKeyPressEvent, args)
    },
    [onKeyPressEvent]
  )

  const handleShowMore = useCallback(
    (events: TEvent[], date: Date, cell: HTMLElement, slot: any, target: HTMLElement) => {
      if(popup) {
        let position = getPosition(cell, containerRef.current || undefined)
        setOverlay({
          date,
          events,
          position: { ...position, width: '200px' },
          target,
        })
      } else if(doShowMoreDrillDown && onDrillDown && getDrilldownView) {
        const view = getDrilldownView(date)
        onDrillDown(date, view || views.DAY, slot)
      }
      onShowMore?.(events, date, slot)
    },
    [popup, doShowMoreDrillDown, onDrillDown, getDrilldownView, onShowMore]
  )

  const handleSelectAllDaySlot = useCallback(
    (slots: Date[], slotInfo: { action: string, resourceId?: string | number }) => {
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
    },
    [onSelectSlot]
  )

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if(scrollRef.current) {
      scrollRef.current.scrollLeft = (e.target as HTMLDivElement).scrollLeft
    }
  }, [])

  const renderOverlay = () => {
    if(!overlay) return null

    return (
      <PopOverlay
        overlay={ overlay }
        accessors={ accessors }
        localizer={ localizer }
        components={ components }
        getters={ getters }
        selected={ selected }
        popupOffset={ popupOffset }
        handleKeyPressEvent={ handleKeyPressEvent }
        handleSelectEvent={ handleSelectEvent }
        handleDoubleClickEvent={ handleDoubleClickEvent }
        handleDragStart={ handleDragStart }
        show={ !!overlay.position }
        overlayDisplay={ () => setOverlay(null) }
        onHide={ () => setOverlay(null) }
      />
    )
  }

  const headerProps = {
    range,
    events: events.filter(event => inRange(event, range[0], range[range.length - 1], accessors, localizer)),
    width: gutterWidth,
    rtl,
    getNow,
    localizer,
    selected,
    allDayMaxRows: showAllEvents ? Infinity : allDayMaxRows ?? Infinity,
    resources: resourceList,
    selectable,
    accessors,
    getters,
    components,
    scrollRef,
    isOverflowing,
    longPressThreshold,
    onSelectSlot: handleSelectAllDaySlot,
    onSelectEvent: handleSelectEvent,
    onShowMore: handleShowMore,
    onDoubleClickEvent,
    onKeyPressEvent,
    onDrillDown,
    getDrilldownView,
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
          { ...{
            date: range?.[0] || new Date(),
            localizer,
            min: range?.[0] ? localizer.merge(range[0], min) : min,
            max: range?.[range.length - 1] ? localizer.merge(range[range.length - 1], max) : max,
            step,
            getNow,
            timeslots,
            components,
            className: "rbc-time-gutter",
            getters,
          } as TimeGutterProps }
          ref={ gutterRef }
        />
        { overlay && (
          <Popup
            { ...{
              overlay,
              accessors,
              localizer,
              components,
              getters,
              selectable,
              selected,
              onHide: () => setOverlay(null),
            } as PopupProps }
          />
        ) }
        { EventsContainer({
          range,
          rangeEvents: events,
          rangeBackgroundEvents: backgroundEvents,
          now: getNow(),
          resourceList,
          resourceGroupingLayout,
          min,
          max,
          components,
          getNow,
          accessors,
          localizer,
          dayLayoutAlgorithm,
          resizable,
          step,
          timeslots,
          selected,
          selectable,
          onSelectSlot,
          onSelectEvent,
          onDoubleClickEvent,
          onKeyPressEvent,
        }) }
      </div>
    </div>
  )
}

export default TimeGrid
