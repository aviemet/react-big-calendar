import { useCallback } from "react"
import { BaseViewProps } from ".."
import { CalendarEvent, Getters } from "@/types"
import PopOverlay from "@/components/PopOverlay"

interface OverlayWrapperProps<TEvent extends CalendarEvent = CalendarEvent> {
  overlay: {
    date: Date
    events: TEvent[]
    position: { x: number, y: number }
    end: Date
    target: HTMLElement
  } | null
  accessors: BaseViewProps['accessors']
  getters: Getters
  selected: object
  popupOffset?: number | { x: number, y: number }
  containerRef: React.RefObject<HTMLDivElement>
  handleSelectEvent: (event: TEvent) => void
  handleDoubleClickEvent: (event: TEvent) => void
  handleKeyPressEvent: (event: TEvent) => void
  handleDragStart?: (event: React.MouseEvent<HTMLElement>) => void
  onHide: () => void
}

const OverlayWrapper = <TEvent extends CalendarEvent = CalendarEvent>({
  overlay,
  accessors,
  getters,
  selected,
  popupOffset,
  containerRef,
  handleSelectEvent,
  handleDoubleClickEvent,
  handleKeyPressEvent,
  handleDragStart,
  onHide,
}: OverlayWrapperProps<TEvent>) => {
  const overlayDisplay = useCallback(() => {
    onHide()
  }, [onHide])

  if(!overlay) return null

  return (
    <PopOverlay
      overlay={ overlay }
      accessors={ accessors }
      getters={ getters }
      selected={ selected }
      popupOffset={ popupOffset }
      ref={ containerRef }
      handleSelectEvent={ handleSelectEvent }
      handleDoubleClickEvent={ handleDoubleClickEvent }
      handleKeyPressEvent={ handleKeyPressEvent }
      handleDragStart={ handleDragStart }
      overlayDisplay={ overlayDisplay }
      onHide={ onHide }
    />
  )
}

export default OverlayWrapper
