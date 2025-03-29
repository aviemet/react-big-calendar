import { Overlay } from "@restart/ui"
import React, { forwardRef, useRef } from "react"

import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"

import { Popup } from "./Popup"

type Overlay = {
  position: { x: number, y: number }
  events: CalendarEvent[]
  date: Date
  end: Date
}

interface PopOverlayProps {
  popupOffset: number | { x: number, y: number }
  overlay: Overlay
  selected: object
  handleSelectEvent: (event: CalendarEvent) => void
  handleDoubleClickEvent: (event: CalendarEvent, e: React.MouseEvent<HTMLElement>) => void
  handleKeyPressEvent: (event: CalendarEvent) => void
  handleDragStart: (event: React.MouseEvent<HTMLElement>) => void
  onHide: () => void
  overlayDisplay: () => void
}

const PopOverlay = forwardRef<HTMLDivElement, PopOverlayProps>((
  {
    popupOffset = 5,
    overlay,
    selected,
    handleSelectEvent,
    handleDoubleClickEvent,
    handleKeyPressEvent,
    handleDragStart,
    onHide,
    overlayDisplay,
  },
  ref
) => {
  const { accessors } = useCalendarContext()
  const popperRef = useRef(null)

  if(!overlay.position) return null

  const offset = typeof popupOffset === "number"
    ? { x: popupOffset, y: popupOffset }
    : popupOffset

  const { position, events, date, end } = overlay
  return (
    <Overlay
      rootClose
      flip
      show
      placement="bottom"
      onHide={ onHide }
      target={ overlay.target }
    >
      { ({ props }) => (
        <Popup
          { ...props }
          ref={ popperRef }
          containerRef={ ref }
          target={ overlay.target }
          offset={ offset }
          accessors={ accessors }
          selected={ selected }
          position={ position }
          show={ overlayDisplay }
          events={ events }
          slotStart={ date }
          slotEnd={ end }
          onSelect={ handleSelectEvent }
          onDoubleClick={ handleDoubleClickEvent }
          onKeyPress={ handleKeyPressEvent }
          handleDragStart={ handleDragStart }
        />
      ) }
    </Overlay>
  )
})

export { PopOverlay }
