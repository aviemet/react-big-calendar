import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import clsx from "clsx"
import * as animationFrame from "dom-helpers/animationFrame"
import getPosition from "dom-helpers/position"
import getWidth from "dom-helpers/width"
import { DayColumn } from "./DayColumn"
import { PopOverlay } from "../PopOverlay"
import { TimeGridHeader } from "./TimeGridHeader"
import { TimeGridHeaderResources } from "./TimeGridHeaderResources"
import { TimeGutter } from "./TimeGutter"
import { inRange, sortEvents } from "@/utils/eventLevels"
import { BaseViewProps } from "@/Views"
import { Resources, Resource } from "@/utils/Resources"
import { Accessors } from "@/utils/accessors"
import { Overlay } from "react-overlays"
import { useCalendarContext } from "@/components/Calendar"
import { CalendarEvent } from "@/utils/components"
import { NoopWrapper } from "../NoopWrapper"
import { useResizeObserver } from "@/hooks/useResizeListener"

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

const TimeGrid = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>(props: TimeGridProps<TEvent, TResource>) => {
  const {
    events,
    backgroundEvents,
    min,
    max,
    scrollToTime,
    getDrilldownView,
    resources,
    resourceGroupingLayout = false,
    step,
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
  } = props

  const { localizer, getNow, accessors } = useCalendarContext()

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

  // const windowSize = useResizeObserver(window)
  // console.log({ windowSize })

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

  useEffect(() => {
    if(width === null) {
      measureGutter()
    }

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

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)

      animationFrame.cancel(rafHandleRef.current)

      if(measureGutterAnimationFrameRequestRef.current) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequestRef.current)
      }
    }
  }, [enableAutoScroll, handleResize, localizer, max, measureGutter, min, scrollToTime, width])

  const memoizedResources = useCallback((resources: Resource[], accessors: Accessors) => (
    Resources(resources, accessors)
  ), [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if(scrollRef.current) {
      scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  // componentDidUpdate() {
  //   applyScroll()
  // }


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
      // notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
    }
    onShowMore?.(events, date, slot)
    // notify(onShowMore, [events, date, slot])
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
    // notify(onSelectSlot, {
    //   slots,
    //   start,
    //   end,
    //   action: slotInfo.action,
    //   resourceId: slotInfo.resourceId,
    // })
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

  const filterEventsInRange = (events: TEvent[], date: Date) => {
    return events.filter(event => (
      localizer.inRange(
        date,
        accessors.start(event),
        accessors.end(event),
        "day"
      )
    ))
  }

  const localResources = memoizedResources(resources, accessors)

  const headerProps = {
    range,
    events: allDayEvents,
    width: width || gutterWidth,
    selected,
    allDayMaxRows: showAllEvents
      ? Infinity
      : allDayMaxRows ?? Infinity,
    resources: localResources,
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

  const DayColumnWrapper = resourceGroupingLayout
    ? (props) => <div style={ { display: "flex", minHeight: "100%", flex: 1 } } { ...props } />
    : NoopWrapper

  return (
    <div
      ref={ containerRef }
      className={ clsx(
        "rbc-time-view",
        { "rbc-time-view-resources": resources && resources.length > 1 }
      ) }
    >
      {
        resources && resources.length > 1 && resourceGroupingLayout
          ? <TimeGridHeaderResources { ...headerProps } />
          : <TimeGridHeader { ...headerProps } />
      }
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

        { range.map((date) => (
          <DayColumnWrapper key={ date.toISOString() }>
            { localResources.map(([id, resource]) => {
              const daysEvents = localResources.groupEvents(rangeEvents).get(id) || []
              const groupedBackgroundEvents = localResources.groupEvents(backgroundEvents).get(id) || []

              return (
                <DayColumn
                  { ...props }
                  key={ `${id}-${date}` }
                  date={ date }
                  resource={ resource }
                  min={ localizer.merge(date, min) }
                  max={ localizer.merge(date, max) }
                  isNow={ localizer.isSameDate(date, getNow()) }
                  events={ filterEventsInRange(daysEvents, date) }
                  backgroundEvents={ filterEventsInRange(groupedBackgroundEvents, date) }
                />
              )
            }) }
          </DayColumnWrapper>
        )) }
      </div>
    </div>
  )
}

export { TimeGrid }


// const DayColumnWrapper = (props) => {
//   const {
//     date,
//     id,
//     resource,
//     groupedEvents,
//     groupedBackgroundEvents,
//     accessors,
//     dayLayoutAlgorithm,
//     now,
//     min,
//     max,
//   } = props

//   const { localizer } = useCalendarContext()

//   const daysEvents = (groupedEvents.get(id) || []).filter((event) =>
//     localizer.inRange(
//       date,
//       accessors.start(event),
//       accessors.end(event),
//       "day"
//     )
//   )

//   const daysBackgroundEvents = (groupedBackgroundEvents.get(id) || []).filter(
//     (event) => localizer.inRange(
//       date,
//       accessors.start(event),
//       accessors.end(event),
//       "day"
//     )
//   )

//   return (
//     <DayColumn
//       { ...props }
//       localizer={ localizer }
//       min={ localizer.merge(date, min) }
//       max={ localizer.merge(date, max) }
//       resource={ resource && id }
//       isNow={ localizer.isSameDate(date, now) }
//       key={ `${id}-${date}` }
//       date={ date }
//       events={ daysEvents }
//       backgroundEvents={ daysBackgroundEvents }
//       dayLayoutAlgorithm={ dayLayoutAlgorithm }
//     />
//   )
// }

// interface ResourcesFirstProps<TResource extends Resource = Resource> {
//   range: Date[]
//   resources: TResource
// }

// const ResourcesFirst = <TResource extends Resource = Resource>({
//   range,
//   resources,
//   ...props
// }: ResourcesFirstProps<TResource>) => {
//   const { localizer } = useCalendarContext()

//   return resources.map(([id, resource]) =>
//     range.map((date) =>
//       <DayColumn
//         { ...props }
//         resource={ resource }
//         localizer={ localizer }
//         min={ localizer.merge(date, min) }
//         max={ localizer.merge(date, max) }
//         isNow={ localizer.isSameDate(date, now) }
//         key={ `${id}-${date}` }
//         date={ date }
//         events={ daysEvents }
//         backgroundEvents={ daysBackgroundEvents }
//         dayLayoutAlgorithm={ dayLayoutAlgorithm }
//       />
//       // <DayColumnWrapper
//       //   resource={ resource }
//       //   { ...props }
//       // />
//     )
//   )
// }

// interface RangeFirstProps<TResource extends Resource = Resource> {
//   range: Date[]
//   resources: TResource
// }

// const RangeFirst = <TResource extends Resource = Resource>({
//   range,
//   resources,
//   ...props
// }: RangeFirstProps<TResource>) => {
//   const { accessors, localizer } = useCalendarContext()

//   return range.map((date) => (
//     <div style={ { display: "flex", minHeight: "100%", flex: 1 } } key={ date.toISOString() }>
//       { resources.map(([id, resource]) => (
//         <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
//           <DayColumn
//             { ...props }
//             date={ date }
//             resource={ resource }
//             min={ localizer.merge(date, min) }
//             max={ localizer.merge(date, max) }
//             isNow={ localizer.isSameDate(date, now) }
//             key={ `${id}-${date}` }
//             events={ daysEvents }
//             backgroundEvents={ daysBackgroundEvents }
//             dayLayoutAlgorithm={ dayLayoutAlgorithm }
//           />
//           { /* <DayColumnWrapper
//             date={ date }
//             resource={ resource }
//             accessors={ accessors }
//             { ...props }
//           /> */ }
//         </div>
//       )) }
//     </div>
//   ))
// }


// { resourceGroupingLayout
//   ? range.map((date) => (
//     <div style={ { display: "flex", minHeight: "100%", flex: 1 } } key={ date.toISOString() }>
//       { resources.map((resource) => (
//         <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
//           <DayColumn
//             { ...props }
//             date={ date }
//             resource={ resource }
//             min={ localizer.merge(date, min) }
//             max={ localizer.merge(date, max) }
//             isNow={ localizer.isSameDate(date, now) }
//             key={ `${resource.id}-${date}` }
//             events={ filterEventsInRange(localResources.groupEvents(events), date) }
//             backgroundEvents={ filterEventsInRange(localResources.groupEvents(backgroundEvents), date) }
//             dayLayoutAlgorithm={ dayLayoutAlgorithm }
//           />
//           { /* <DayColumnWrapper
//             date={ date }
//             resource={ resource }
//             accessors={ accessors }
//             { ...props }
//           /> */ }
//         </div>
//       )) }
//     </div>
//   ))
//   // <RangeFirst
//   //   resources={ localResources }
//   //   groupedEvents={ localResources.groupEvents(events) }
//   //   groupedBackgroundEvents={ localResources.groupEvents(backgroundEvents) }
//   //   min={ min }
//   //   max={ max }
//   // />
//   : resources.map((resource) =>
//     range.map((date) =>
//       <DayColumn
//         { ...props }
//         resource={ resource }
//         localizer={ localizer }
//         min={ localizer.merge(date, min) }
//         max={ localizer.merge(date, max) }
//         isNow={ localizer.isSameDate(date, now) }
//         key={ `${resource.id}-${date}` }
//         date={ date }
//         events={ filterEventsInRange(localResources.groupEvents(events), date) }
//         backgroundEvents={ filterEventsInRange(localResources.groupEvents(backgroundEvents), date) }
//         dayLayoutAlgorithm={ dayLayoutAlgorithm }
//       />
//       // <DayColumnWrapper
//       //   resource={ resource }
//       //   { ...props }
//       // />
//     )
//   )
//   // <ResourcesFirst
//   //   resources={ localResources }
//   //   groupedEvents={ localResources.groupEvents(events) }
//   //   groupedBackgroundEvents={ localResources.groupEvents(backgroundEvents) }
//   //   accessors={ accessors }
//   //   min={ min }
//   //   max={ max }
//   // />
// }
