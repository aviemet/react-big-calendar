import getOffset from "dom-helpers/offset"
import React, { forwardRef, useLayoutEffect } from "react"

import { useCalendarContext } from "@/Calendar"
import { EventCell } from "@/components/EventRow/EventCell"
import { useClickOutside } from "@/hooks/useClickOutside"
import { CalendarEvent } from "@/utils/components"
import { isSelected } from "@/utils/eventSelectionHelpers"

// TODO: Replaced react-overlays with @restart/ui, let's see if that changes anything
/**
 * Changes to react-overlays cause issue with auto positioning,
 * so we need to manually calculate the position of the popper,
 * and constrain it to the Month container.
 */
function getPosition(
  { target, offset, container, box }:
  { target: HTMLElement, offset: { x: number, y: number }, container: HTMLElement, box: HTMLElement }
) {
  const { top, left, width, height } = getOffset(target)
  const {
    top: cTop,
    left: cLeft,
    width: cWidth,
    height: cHeight,
  } = getOffset(container)
  const { width: bWidth, height: bHeight } = getOffset(box)
  const viewBottom = cTop + cHeight
  const viewRight = cLeft + cWidth
  const bottom = top + bHeight
  const right = left + bWidth
  const { x, y } = offset
  const topOffset = bottom > viewBottom ? top - bHeight - y : top + y + height
  const leftOffset = right > viewRight ? left + x - bWidth + width : left + x

  return {
    topOffset,
    leftOffset,
  }
}

interface PopupProps<TEvent extends CalendarEvent = CalendarEvent> {
  containerRef: React.RefObject<HTMLDivElement>
  selected: TEvent
  position: { x: number, y: number, width: number }
  show: () => void
  events: TEvent[]
  slotStart: Date
  slotEnd: Date
  onSelect: (event: TEvent) => void
  onDoubleClick: (event: TEvent) => void
  onKeyPress: (event: TEvent) => void
  handleDragStart: (event: TEvent) => void
  popperRef: React.RefObject<HTMLDivElement>
  target: HTMLElement
  offset: { x: number, y: number }
}

const PopupComponent = <TEvent extends CalendarEvent = CalendarEvent>(
  props: PopupProps<TEvent>,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    containerRef,
    selected,
    position,
    show,
    events,
    slotStart,
    slotEnd,
    onSelect,
    onDoubleClick,
    onKeyPress,
    handleDragStart,
    target,
    offset,
  } = props

  const { localizer, accessors } = useCalendarContext()

  useClickOutside({ ref: ref, callback: show })

  useLayoutEffect(() => {
    if(!ref || !("current" in ref)) return

    const { topOffset, leftOffset } = getPosition({
      target,
      offset,
      container: containerRef.current,
      box: ref.current,
    })
    ref.current.style.top = `${topOffset}px`
    ref.current.style.left = `${leftOffset}px`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset.x, offset.y, target])

  const { width } = position
  const style = {
    minWidth: width + width / 2,
  }

  return (
    <div style={ style } className="rbc-overlay" ref={ ref }>
      <div className="rbc-overlay-header">
        { localizer.format(slotStart, "dayHeaderFormat") }
      </div>
      { events.map((event, Index) => (
        <EventCell
          key={ Index }
          type="popup" // type was not implemented, chose to implement rather than remove
          event={ event }
          onSelect={ onSelect }
          onDoubleClick={ onDoubleClick }
          onKeyPress={ onKeyPress }
          continuesPrior={ localizer.lt(accessors.end(event), slotStart, "day") }
          continuesAfter={ localizer.gte(accessors.start(event), slotEnd, "day") }
          slotStart={ slotStart }
          slotEnd={ slotEnd }
          selected={ isSelected(event, selected) }
          draggable={ true } // TODO: EventCell signature can be different when dragable addon is enabled
          onDragStart={ () => handleDragStart(event) }
          onDragEnd={ () => show() }
        />
      )) }
    </div>
  )
}

export const Popup = forwardRef(PopupComponent)
