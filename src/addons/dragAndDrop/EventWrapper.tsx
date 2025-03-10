import clsx from "clsx"
import { accessor as get } from "@/utils/accessors"
import { CalendarEvent } from "@/utils/components"
import { useDndContext } from "./withDragAndDrop"
import React from "react"

interface EventWrapperProps<TEvent extends CalendarEvent = CalendarEvent> {
  children: React.ReactNode
  type: "date" | "time"
  event: TEvent
  draggable: boolean
  allDay: boolean
  isRow: boolean
  continuesPrior: boolean
  continuesAfter: boolean
  isDragging: boolean
  isResizing: boolean
  resource: number
  resizable: boolean
}

const EventWrapper = <TEvent extends CalendarEvent = CalendarEvent>({
  children,
  type,
  event,
  draggable,
  allDay,
  isRow,
  continuesPrior,
  continuesAfter,
  isDragging,
  isResizing,
  resource,
  resizable,
}: EventWrapperProps<TEvent>) => {
  const context = useDndContext()

  const handleResizeUp = (e) => {
    if(e.button !== 0) return
    context.draggable.onBeginAction(event, "resize", "UP")
  }
  const handleResizeDown = (e) => {
    if(e.button !== 0) return
    context.draggable.onBeginAction(event, "resize", "DOWN")
  }
  const handleResizeLeft = (e) => {
    if(e.button !== 0) return
    context.draggable.onBeginAction(event, "resize", "LEFT")
  }
  const handleResizeRight = (e) => {
    if(e.button !== 0) return
    context.draggable.onBeginAction(event, "resize", "RIGHT")
  }
  const handleStartDragging = (e) => {
    if(e.button !== 0) return
    /*
     * hack: because of the way the anchors are arranged in the DOM, resize
     * anchor events will bubble up to the move anchor listener. Don't start
     * move operations when we're on a resize anchor.
     */
    const isResizeHandle = e.target
      .getAttribute("class")
      ?.includes("rbc-addons-dnd-resize")
    if(!isResizeHandle) {
      let extendedEvent = { ...event }
      extendedEvent.sourceResource = resource
      context.draggable.onBeginAction(event, "move")
    }
  }


  const renderAnchor = (direction) => {
    const cls = direction === "Up" || direction === "Down" ? "ns" : "ew"
    return (
      <div
        className={ `rbc-addons-dnd-resize-${cls}-anchor` }
        onMouseDown={ this[`handleResize${direction}`] }
      >
        <div className={ `rbc-addons-dnd-resize-${cls}-icon` } />
      </div>
    )
  }
  // render()

  if(event.__isPreview)
    return React.cloneElement(children, {
      className: clsx(
        children.className,
        "rbc-addons-dnd-drag-preview"
      ),
    })

  const { draggableAccessor, resizableAccessor } = context.draggable

  const isDraggable = draggableAccessor
    ? !!get(event, draggableAccessor)
    : true

  /* Event is not draggable, no need to wrap it */
  if(!isDraggable) {
    return children
  }

  /*
   * The resizability of events depends on whether they are
   * allDay events and how they are displayed.
   *
   * 1. If the event is being shown in an event row (because
   * it is an allDay event shown in the header row or because as
   * in month view the view is showing all events as rows) then we
   * allow east-west resizing.
   *
   * 2. Otherwise the event is being displayed
   * normally, we can drag it north-south to resize the times.
   *
   * See `DropWrappers` for handling of the drop of such events.
   *
   * Notwithstanding the above, we never show drag anchors for
   * events which continue beyond current component. This happens
   * in the middle of events when showMultiDay is true, and to
   * events at the edges of the calendar's min/max location.
   */
  const isResizable =
      resizable && (resizableAccessor ? !!get(event, resizableAccessor) : true)

  if(isResizable || isDraggable) {
    /*
     * children is the singular <Event> component.
     * BigCalendar positions the Event abolutely and we
     * need the anchors to be part of that positioning.
     * So we insert the anchors inside the Event's children
     * rather than wrap the Event here as the latter approach
     * would lose the positioning.
     */
    const newProps = {
      onMouseDown: handleStartDragging,
      onTouchStart: handleStartDragging,
    }

    if(isResizable) {
      // replace original event child with anchor-embellished child
      let StartAnchor = null
      let EndAnchor = null

      if(type === "date") {
        StartAnchor = !continuesPrior && renderAnchor("Left")
        EndAnchor = !continuesAfter && renderAnchor("Right")
      } else {
        StartAnchor = !continuesPrior && renderAnchor("Up")
        EndAnchor = !continuesAfter && renderAnchor("Down")
      }

      const newchildren = (
        <div className="rbc-addons-dnd-resizable">
          { StartAnchor }
          { children.children }
          { EndAnchor }
        </div>
      )
    }

    if(
      context.draggable.dragAndDropAction.interacting && // if an event is being dragged right now
        context.draggable.dragAndDropAction.event === event // and it's the current event
    ) {
      // add a new class to it
      newclassName = clsx(
        children.className,
        "rbc-addons-dnd-dragged-event"
      )
    }

    children = React.cloneElement(children, newProps)
  }

  return children
}

export { EventWrapper }
