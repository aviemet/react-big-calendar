import { useEffect, useRef, useState } from "react"

import { useCalendarContext } from "@/Calendar"
import { EventRow } from "@/components/EventRow"
import { DateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { eventSegments } from "@/utils/eventLevels"
import { getSlotAtX, pointInBox } from "@/utils/eventSelectionHelpers"
import { Selection, getBoundsForNode } from "@/utils/selection"

import { dragAccessors, eventTimes } from "./common"
import { useDndContext } from "./withDragAndDrop"


interface WeekWrapperProps {
  children: React.ReactNode
  isAllDay?: boolean
  slotMetrics: DateSlotMetrics
  resourceId: number | string
}

const WeekWrapper = ({
  children,
  isAllDay,
  slotMetrics,
  resourceId,
}: WeekWrapperProps) => {
  const { accessors, localizer, rtl } = useCalendarContext()

  const context = useDndContext()

  const wrapperRef = useRef(null)

  const [segment, setSegment] = useState()

  useEffect(() => {
    initSelectable()
    return teardownSelectable
  }, [])

  const reset = () => {
    if(segment) setSegment(null)
  }

  const update = (event, start, end) => {
    const newSegment = eventSegments(
      { ...event, end, start, __isPreview: true },
      slotMetrics.range,
      dragAccessors,
      localizer
    )

    if(
      segment &&
      newSegment.span === segment.span &&
      newSegment.left === segment.left &&
      newSegment.right === segment.right
    ) {
      return
    }

    setSegment(newSegment)
  }

  const handleMove = (point, bounds, draggedEvent) => {
    if(!pointInBox(bounds, point)) return reset()
    const event = context.draggable.dragAndDropAction.event || draggedEvent

    const slot = getSlotAtX(bounds, point.x, rtl, slotMetrics.slots)

    const date = slotMetrics.getDateForSlot(slot)

    // Adjust the dates, but maintain the times when moving
    let { start, duration } = eventTimes(event, accessors, localizer)
    start = localizer.merge(date, start)
    const end = localizer.add(start, duration, "milliseconds")
    // LATER: when dragging a multi-row event, only the first row is animating
    update(event, start, end)
  }

  const handleDropFromOutside = (point, bounds) => {
    if(!context.draggable.onDropFromOutside) return
    const { slotMetrics, rtl, localizer } = props

    const slot = getSlotAtX(bounds, point.x, rtl, slotMetrics.slots)
    const start = slotMetrics.getDateForSlot(slot)

    context.draggable.onDropFromOutside({
      start,
      end: localizer.add(start, 1, "day"),
      allDay: false,
    })
  }

  const handleDragOverFromOutside = (point, node) => {
    const item = context.draggable.dragFromOutsideItem ? context.draggable.dragFromOutsideItem() : null
    if(!item) return
    handleMove(point, node, item)
  }

  const handleResize = (point, bounds) => {
    const { event, direction } = context.draggable.dragAndDropAction

    let { start, end } = eventTimes(event, accessors, localizer)

    const slot = getSlotAtX(bounds, point.x, rtl, slotMetrics.slots)
    const date = slotMetrics.getDateForSlot(slot)
    const cursorInRow = pointInBox(bounds, point)

    if(direction === "RIGHT") {
      if(cursorInRow) {
        if(slotMetrics.last < start) return reset()
        if(localizer.eq(localizer.startOf(end, "day"), end))
          end = localizer.add(date, 1, "day")
        else end = date
      } else if(
        localizer.inRange(start, slotMetrics.first, slotMetrics.last) ||
        (bounds.bottom < point.y && +slotMetrics.first > +start)
      ) {
        end = localizer.add(slotMetrics.last, 1, "milliseconds")
      } else {
        setSegment(null)
        return
      }
      const originalEnd = accessors.end(event)
      end = localizer.merge(end, originalEnd)
      if(localizer.lt(end, start)) {
        end = originalEnd
      }
    } else if(direction === "LEFT") {
      if(cursorInRow) {
        if(slotMetrics.first > end) return reset()
        start = date
      } else if(
        localizer.inRange(end, slotMetrics.first, slotMetrics.last) ||
        (bounds.top > point.y && localizer.lt(slotMetrics.last, end))
      ) {
        start = localizer.add(slotMetrics.first, -1, "milliseconds")
      } else {
        reset()
        return
      }
      const originalStart = accessors.start(event)
      start = localizer.merge(start, originalStart)
      if(localizer.gt(start, end)) {
        start = originalStart
      }
    }

    update(event, start, end)
  }

  const initSelectable = () => {
    let node = wrapperRef.current.closest(".rbc-month-row, .rbc-allday-cell")
    let container = node.closest(".rbc-month-view, .rbc-time-view")
    let isMonthRow = node.classList.contains("rbc-month-row")

    // Valid container check only necessary in TimeGrid views
    let selector = (_selector = new Selection(() => container, {
      validContainers: [
        ...(!isMonthRow ? [".rbc-day-slot", ".rbc-allday-cell"] : []),
      ],
    }))

    selector.on("beforeSelect", (point) => {
      const { action } = context.draggable.dragAndDropAction
      const bounds = getBoundsForNode(node)
      const isInBox = pointInBox(bounds, point)
      return (
        action === "move" || (action === "resize" && (!isAllDay || isInBox))
      )
    })

    selector.on("selecting", (box) => {
      const bounds = getBoundsForNode(node)
      const { dragAndDropAction } = context.draggable
      if(dragAndDropAction.action === "move") handleMove(box, bounds)
      if(dragAndDropAction.action === "resize") handleResize(box, bounds)
    })

    selector.on("selectStart", () => context.draggable.onStart())

    selector.on("select", (point) => {
      const bounds = getBoundsForNode(node)
      if(!segment) return
      if(!pointInBox(bounds, point)) {
        reset()
      } else {
        handleInteractionEnd()
      }
    })

    selector.on("dropFromOutside", (point) => {
      if(!context.draggable.onDropFromOutside) return
      const bounds = getBoundsForNode(node)
      if(!pointInBox(bounds, point)) return
      handleDropFromOutside(point, bounds)
    })

    selector.on("dragOverFromOutside", (point) => {
      if(!context.draggable.dragFromOutsideItem) return
      const bounds = getBoundsForNode(node)

      handleDragOverFromOutside(point, bounds)
    })

    selector.on("click", () => context.draggable.onEnd(null))

    selector.on("reset", () => {
      reset()
      context.draggable.onEnd(null)
    })
  }

  const handleInteractionEnd = () => {
    const { event } = segment

    reset()

    context.draggable.onEnd({
      start: event.start,
      end: event.end,
      resourceId,
      isAllDay,
    })
  }

  const teardownSelectable = () => {
    if(!_selector) return
    _selector.teardown()
    _selector = null
  }

  // render() {

  return (
    <div ref={ wrapperRef } className="rbc-addons-dnd-row-body">
      { children }

      { segment && (
        <EventRow
          selected={ null }
          className="rbc-addons-dnd-drag-row"
          segments={ [segment] }
          accessors={ {
            ...accessors,
            ...dragAccessors,
          } }
        />
      ) }
    </div>
  )

}

export { WeekWrapper }
