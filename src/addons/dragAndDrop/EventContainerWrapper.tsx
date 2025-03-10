import React, { useEffect, useRef, useState } from "react"
import { scrollParent, scrollTop } from "dom-helpers"
import qsa from "dom-helpers/cjs/querySelectorAll"
import {
  Selection,
  getBoundsForNode,
  getEventNodeFromPoint,
} from "@/utils/selection"
import { TimeGridEvent } from "@/components/TimeGrid/TimeGridEvent"
import { dragAccessors, eventTimes, pointInColumn } from "./common"
import { useCalendarContext } from "@/components/Calendar"
import { Resource } from "@/utils/Resources"
import { CalendarEvent } from "@/utils/components"
import { useDndContext } from "./withDragAndDrop"
import { TimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"

type DndPositionState<TEvent extends CalendarEvent = CalendarEvent> = {
  top: number
  end: number
  height: number
  event: TEvent
}

interface EventContainerWrapperProps {
  children: React.ReactNode
  slotMetrics: TimeSlotMetrics
  resource: Resource
}

const EventContainerWrapper = <TEvent extends CalendarEvent = CalendarEvent>({
  children,
  slotMetrics,
  resource,
}: EventContainerWrapperProps<TEvent>) => {
  const { accessors, localizer } = useCalendarContext()

  const context = useDndContext()

  const [position, setPosition] = useState<DndPositionState<TEvent>>({
    event: null,
    top: null,
    end: null,
    height: null,
  })

  const wrapperRef = useRef(null)

  useEffect(() => {
    initSelectable()
    return teardownSelectable
  }, [])

  const reset = () => {
    if(position.event)
      setPosition({ event: null, top: null, end: null, height: null })
  }

  const update = (event: TEvent, { startDate, endDate, top, height }: {
    startDate: Date
    endDate: Date
    top: number
    height: number
  }) => {
    if(
      position.event &&
      startDate === position.event.start &&
      endDate === position.event.end
    ) {
      return
    }

    setPosition(prev => ({
      ...prev,
      top,
      height,
      event: { ...event, start: startDate, end: endDate },
    }))
  }

  const handleMove = (point: number, bounds) => {
    if(!pointInColumn(bounds, point)) return reset()
    const { event } = context.draggable.dragAndDropAction

    const newSlot = slotMetrics.closestSlotFromPoint(
      { y: point.y - eventOffsetTop, x: point.x },
      bounds
    )

    const { duration } = eventTimes(event, accessors, localizer)
    let newEnd = localizer.add(newSlot, duration, "milliseconds")
    update(event, slotMetrics.getRange(newSlot, newEnd, false, true))
  }

  const handleResize = (point: number, bounds) => {
    const { event, direction } = context.draggable.dragAndDropAction
    const newTime = slotMetrics.closestSlotFromPoint(point, bounds)

    let { start, end } = eventTimes(event, accessors, localizer)
    let newRange
    if(direction === "UP") {
      const newStart = localizer.min(
        newTime,
        slotMetrics.closestSlotFromDate(end, -1)
      )
      /*
       * Get the new range based on the new start
       * but don't overwrite the end date as it could be outside this day boundary.
       */
      newRange = slotMetrics.getRange(newStart, end)
      newRange = {
        ...newRange,
        endDate: end,
      }
    } else if(direction === "DOWN") {
      /*
       * Get the new range based on the new end
       * but don't overwrite the start date as it could be outside this day boundary.
       */
      const newEnd = localizer.max(
        newTime,
        slotMetrics.closestSlotFromDate(start)
      )
      newRange = slotMetrics.getRange(start, newEnd)
      newRange = {
        ...newRange,
        startDate: start,
      }
    }

    update(event, newRange)
  }

  const handleDropFromOutside = (point: number, boundaryBox) => {
    let start = slotMetrics.closestSlotFromPoint(
      { y: point.y, x: point.x },
      boundaryBox
    )

    const end = _calculateDnDEnd(start)

    context.draggable.onDropFromOutside({
      start,
      end,
      allDay: false,
      resource,
    })
  }

  const handleDragOverFromOutside = (point, bounds) => {
    const start = slotMetrics.closestSlotFromPoint(
      { y: point.y, x: point.x },
      bounds
    )
    const end = _calculateDnDEnd(start)
    const event = context.draggable.dragFromOutsideItem()
    update(event, slotMetrics.getRange(start, end, false, true))
  }

  const _calculateDnDEnd = (start: number) => {
    const event = context.draggable.dragFromOutsideItem()
    const { duration: eventDuration } = eventTimes(event, accessors, localizer)

    let end = slotMetrics.nextSlot(start)
    const eventHasDuration = !isNaN(eventDuration)
    if(eventHasDuration) {
      const eventEndSlot = localizer.add(start, eventDuration, "milliseconds")
      end = new Date(Math.max(eventEndSlot, end))
    }
    return end
  }

  const updateParentScroll = (parent, node) => {
    setTimeout(() => {
      const draggedEl = qsa(node, ".rbc-addons-dnd-drag-preview")[0]
      if(draggedEl) {
        if(draggedEl.offsetTop < parent.scrollTop) {
          scrollTop(parent, Math.max(draggedEl.offsetTop, 0))
        } else if(
          draggedEl.offsetTop + draggedEl.offsetHeight >
          parent.scrollTop + parent.clientHeight
        ) {
          scrollTop(
            parent,
            Math.min(
              draggedEl.offsetTop -
              parent.offsetHeight +
              draggedEl.offsetHeight,
              parent.scrollHeight
            )
          )
        }
      }
    })
  }

  const initSelectable = () => {
    let wrapper = wrapperRef.current
    let node = wrapper.children[0]
    let isBeingDragged = false
    let selector = (_selector = new Selection(() =>
      wrapper.closest(".rbc-time-view")
    ))
    let parent = scrollParent(wrapper)

    selector.on("beforeSelect", (point) => {
      const { dragAndDropAction } = context.draggable

      if(!dragAndDropAction.action) return false
      if(dragAndDropAction.action === "resize") {
        return pointInColumn(getBoundsForNode(node), point)
      }

      const eventNode = getEventNodeFromPoint(node, point)
      if(!eventNode) return false

      /*
       * eventOffsetTop is distance from the top of the event to the initial
       * mouseDown position. We need this later to compute the new top of the
       * event during move operations, since the final location is really a
       * delta from this point. note: if we want to DRY this with WeekWrapper,
       * probably better just to capture the mouseDown point here and do the
       * placement computation in handleMove()...
       */
      eventOffsetTop = point.y - getBoundsForNode(eventNode).top
    })

    selector.on("selecting", (box) => {
      const bounds = getBoundsForNode(node)
      const { dragAndDropAction } = context.draggable

      if(dragAndDropAction.action === "move") {
        updateParentScroll(parent, node)
        handleMove(box, bounds)
      }
      if(dragAndDropAction.action === "resize") {
        updateParentScroll(parent, node)
        handleResize(box, bounds)
      }
    })

    selector.on("dropFromOutside", (point) => {
      if(!context.draggable.onDropFromOutside) return
      const bounds = getBoundsForNode(node)
      if(!pointInColumn(bounds, point)) return
      handleDropFromOutside(point, bounds)
    })

    selector.on("dragOverFromOutside", (point) => {
      const item = context.draggable.dragFromOutsideItem ? context.draggable.dragFromOutsideItem() : null
      if(!item) return
      const bounds = getBoundsForNode(node)
      if(!pointInColumn(bounds, point)) return reset()
      handleDragOverFromOutside(point, bounds)
    })

    selector.on("selectStart", () => {
      isBeingDragged = true
      context.draggable.onStart()
    })

    selector.on("select", (point) => {
      const bounds = getBoundsForNode(node)
      isBeingDragged = false
      const { dragAndDropAction } = context.draggable
      if(dragAndDropAction.action === "resize") {
        handleInteractionEnd()
      } else if(!state.event || !pointInColumn(bounds, point)) {
        return
      } else {
        handleInteractionEnd()
      }
    })

    selector.on("click", () => {
      if(isBeingDragged) reset()
      context.draggable.onEnd(null)
    })
    selector.on("reset", () => {
      reset()
      context.draggable.onEnd(null)
    })
  }

  const handleInteractionEnd = () => {
    const { event } = position
    reset()

    context.draggable.onEnd({
      start: event.start,
      end: event.end,
      resourceId: resource,
    })
  }

  const teardownSelectable = () => {
    if(!_selector) return
    _selector.teardown()
    _selector = null
  }

  let { event } = position
  if(!event) return children

  const events = children.props.children
  const { start, end } = event

  let label
  let format = "eventTimeRangeFormat"

  const startsBeforeDay = slotMetrics.startsBeforeDay(start)
  const startsAfterDay = slotMetrics.startsAfterDay(end)

  if(startsBeforeDay) {
    format = "eventTimeRangeEndFormat"
  } else if(startsAfterDay) {
    format = "eventTimeRangeStartFormat"
  }

  if(startsBeforeDay && startsAfterDay) {
    label = localizer.messages.allDay
  } else {
    label = localizer.format({ start, end }, format)
  }

  return <div ref={ wrapperRef }>{
    React.cloneElement(children, {
      children: (
        <>
          { events }

          { event && (
            <TimeGridEvent
              event={ event }
              label={ label }
              className="rbc-addons-dnd-drag-preview"
              style={ { top: position.top, height: position.height, width: 100 } }
              accessors={ { ...accessors, ...dragAccessors } }
              continuesPrior={ startsBeforeDay }
              continuesAfter={ startsAfterDay }
            />
          ) }
        </>
      ),
    }) }</div>
}

export { EventContainerWrapper }
