import clsx from "clsx"
import * as animationFrame from "dom-helpers/animationFrame"
import getPosition from "dom-helpers/position"
import getWidth from "dom-helpers/width"
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Overlay } from "react-overlays"

import { useCalendarContext } from "@/Calendar"
import { useResizeObserver } from "@/hooks/useResizeListener"
import { CalendarEvent } from "@/utils/components"
import { inRange, sortEvents } from "@/utils/eventLevels"
import { ResourceManager, Resource } from "@/utils/Resources"
import { BaseViewProps } from "@/Views"

import { DayColumns } from "./DayColumns"
import { TimeGutter } from "./TimeGutter"
import { PopOverlay } from "../PopOverlay"
import { TimeGridHeader } from "./TimeGridHeader"

interface TimeGridProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> extends BaseViewProps<TEvent, TResource> {
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

const TimeGrid = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>({
  events,
  backgroundEvents,
  min,
  max,
  scrollToTime,
  getDrilldownView,
  resources,
  resourceGroupingLayout = false,
  step = 30,
  timeslots,
  range,
  enableAutoScroll,
  showMultiDayTimes,
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
  showAllEvents,
  doShowMoreDrillDown,
  popup,
  handleDragStart,
  popupOffset,
}: TimeGridProps<TEvent, TResource>) => {
  const { localizer, accessors } = useCalendarContext()

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

  const containerSize = useResizeObserver(containerRef)

  const checkOverflow = useCallback(() => {
    if(updatingOverflowRef.current === true) return

    const content = contentRef.current

    if(!content?.scrollHeight) return

    if(isOverflowing !== content.scrollHeight > content.clientHeight) {
      updatingOverflowRef.current = true
      setIsOverflowing(false)
    }
  }, [isOverflowing])

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
  }, [checkOverflow])

  useLayoutEffect(() => {
    if(!width) measureGutter()
  }, [width, measureGutter])

  useLayoutEffect(() => {
    const diffMillis = localizer.diff(
      localizer.merge(scrollToTime, min),
      scrollToTime,
      "milliseconds"
    )
    const totalMillis = localizer.diff(min, max, "milliseconds")

    scrollRatioRef.current = diffMillis / totalMillis

    // If auto-scroll is disabled, we don't actually apply the scroll
    if(scrollRatioRef.current !== null && enableAutoScroll === true) {
      const content = contentRef.current
      content.scrollTop = content.scrollHeight * scrollRatioRef.current
      // Only do this once
      scrollRatioRef.current = null
    }
  }, [enableAutoScroll, localizer, max, min, scrollToTime])

  useLayoutEffect(() => {
    animationFrame.cancel(rafHandleRef.current)
    rafHandleRef.current = animationFrame.request(checkOverflow)

    return () => {
      animationFrame.cancel(rafHandleRef.current)

      if(measureGutterAnimationFrameRequestRef.current) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequestRef.current)
      }
    }
  }, [checkOverflow, containerSize])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if(scrollRef.current) {
      scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  const handleSelectEvent = (...args) => {
    // cancel any pending selections so only the event click goes through.
    // clearSelection()
    onSelectEvent?.(args)
  }

  const handleShowMore = (events: TEvent[], date: Date, cell, slot, target) => {
    // clearSelection()

    if(popup) {
      let position = getPosition(cell, containerRef.current)

      setOverlay({
        date,
        events,
        position: { ...position, width: "200px" },
        target,
      })
    } else if(doShowMoreDrillDown) {
      onDrillDown?.([date, getDrilldownView?.(date) || views.DAY])
    }
    onShowMore?.(events, date, slot)
  }

  const handleSelectAllDaySlot = (slots, slotInfo) => {
    const start = new Date(slots[0])
    const end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)

    onSelectSlot?.({
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

  const { allDayEvents, rangeEvents, rangeBackgroundEvents } = useMemo(() => {
    const start = range[0]
    const end = range[range.length - 1]

    const allDayEvents: TEvent[] = []
    const rangeEvents: TEvent[] = []
    const rangeBackgroundEvents: TEvent[] = []

    events.forEach((event) => {
      if(inRange(event, start, end, accessors, localizer)) {
        const eStart = accessors.start(event)
        const eEnd = accessors.end(event)

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
  }, [range, events, backgroundEvents, accessors, localizer, showMultiDayTimes])

  const resourceManager = useMemo(() => ResourceManager(resources, accessors), [accessors, resources])

  const groupedEvents = resourceManager.groupEvents(rangeEvents)
  const groupedBackgroundEvents = resourceManager.groupEvents(rangeBackgroundEvents)

  const headerProps = {
    range,
    events: allDayEvents,
    width: width || gutterWidth,
    selected,
    allDayMaxRows: showAllEvents
      ? Infinity
      : allDayMaxRows ?? Infinity,
    resources: resourceManager,
    resourceGroupingLayout: resources && resources.length > 1 && resourceGroupingLayout,
    selectable: selectable,
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
      className={ clsx("rbc-time-view", {
        "rbc-time-view-resources": resources && resources.length > 1,
      }) }
    >
      <TimeGridHeader { ...headerProps } />

      { popup && <PopOverlay
        ref={ containerRef }
        overlay={ overlay }
        selected={ selected }
        popupOffset={ popupOffset }
        handleKeyPressEvent={ (e) => onKeyPressEvent?.(e) }
        handleSelectEvent={ handleSelectEvent }
        handleDoubleClickEvent={ (event, e) => onDoubleClickEvent?.(event, e) }
        handleDragStart={ handleDragStart }
        show={ !!overlay?.position }
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
          timeslots={ timeslots }
        />

        <DayColumns
          range={ range }
          resourceManager={ resourceManager }
          groupedEvents={ groupedEvents }
          groupedBackgroundEvents={ groupedBackgroundEvents }
          selected={ selected }
          min={ min }
          max={ max }
          step={ step }
          timeslots={ timeslots }
          showMultiDayTimes={ showMultiDayTimes }
          longPressThreshold={ longPressThreshold }
        />

        { /* { !resourceGroupingLayout
          ? resourceManager.map(([id, resource]) => {

            return range.map((date) => (
              <DayColumnWrapper
                key={ date.toISOString() }
                date={ date }
                id={ id }
                resource={ resource }
                groupedEvents={ groupedEvents }
                groupedBackgroundEvents={ groupedBackgroundEvents }
                min={ min }
                max={ max }
                step={ step }
                timeslots={ timeslots }
              />
            ))
          })
          : range.map((date) => {
            return (
              <div style={ { display: "flex", minHeight: "100%", flex: 1 } } key={ date.toISOString() }>
                { resourceManager.map(([id, resource]) => (
                  <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
                    <DayColumnWrapper
                      date={ date }
                      id={ id }
                      resource={ resource }
                      groupedEvents={ groupedEvents }
                      groupedBackgroundEvents={ groupedBackgroundEvents }
                      min={ min }
                      max={ max }
                      step={ step }
                      timeslots={ timeslots }
                    />
                  </div>
                )) }
              </div>
            )
          }) } */ }
      </div>
    </div>
  )

}

export { TimeGrid }
