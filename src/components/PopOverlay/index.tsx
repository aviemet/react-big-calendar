import React, { forwardRef, useRef } from 'react'
import { Overlay } from 'react-overlays'
import Popup from './Popup'
import { CalendarEvent, Getters, Components } from '@/types'
import { Accessors } from '@/utils/accessors'
import { DateLocalizer } from '@/localizers'

interface PopOverlayProps {
  popupOffset: number | { x: number, y: number }
  overlay: {
    position: { x: number, y: number }
    events: CalendarEvent[]
    date: Date
    end: Date
  }
  accessors: Accessors
  getters: Getters
  selected: object
  handleSelectEvent: (event: CalendarEvent) => void
  handleDoubleClickEvent: (event: CalendarEvent) => void
  handleKeyPressEvent: (event: CalendarEvent) => void
  handleDragStart: (event: React.MouseEvent<HTMLElement>) => void
  onHide: () => void
  overlayDisplay: () => void
  components: Components
  localizer: DateLocalizer
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
    components,
    localizer,
  },
  ref) => {

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
