import React, { forwardRef, useRef } from 'react'
import { Overlay } from 'react-overlays'
import Popup from './Popup'
import { Accessors, Getters } from '@/types'
import { useCalendarContext } from '@/components/Calendar'

interface PopOverlayProps {
  popupOffset: number | { x: number, y: number }
  overlay: {
    position: { x: number, y: number }
    events: Event[]
    date: Date
    end: Date
  }
  accessors: Accessors
  getters: Getters
  selected: object
  handleSelectEvent: (event: Event) => void
  handleDoubleClickEvent: (event: Event) => void
  handleKeyPressEvent: (event: Event) => void
  handleDragStart: (event: React.MouseEvent<HTMLElement>) => void
  onHide: () => void
  overlayDisplay: () => void
}

const PopOverlay = forwardRef<HTMLDivElement, PopOverlayProps>((
  {
    popupOffset = 5,
    overlay,
    accessors,
    getters,
    selected,
    handleSelectEvent,
    handleDoubleClickEvent,
    handleKeyPressEvent,
    handleDragStart,
    onHide,
    overlayDisplay,
  },
  ref) => {
  const { localizer, components } = useCalendarContext()

  const popperRef = useRef(null)

  if(!overlay.position) return null

  let offset = popupOffset
  if(!isNaN(popupOffset)) {
    offset = { x: popupOffset, y: popupOffset }
  }

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
          getters={ getters }
          selected={ selected }
          components={ components }
          localizer={ localizer }
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

export default PopOverlay
