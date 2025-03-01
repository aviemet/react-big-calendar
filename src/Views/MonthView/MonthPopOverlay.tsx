import { useCallback } from "react"
import { BaseViewProps } from ".."
import { Getters } from "@/types"
import PopOverlay from "@/components/PopOverlay"

interface OverlayWrapperProps {
  overlay: {
    date: Date
    events: Event[]
    position: { x: number, y: number }
    end: Date
    target: HTMLElement
  } | null
  accessors: BaseViewProps['accessors']
  getters: Getters
  selected: object
  popupOffset?: number | { x: number, y: number }
  containerRef: React.RefObject<HTMLDivElement>
  handleSelectEvent: (event: Event) => void
  handleDoubleClickEvent: (event: Event) => void
  handleKeyPressEvent: (event: Event) => void
  handleDragStart?: (event: React.MouseEvent<HTMLElement>) => void
  onHide: () => void
}

const OverlayWrapper: React.FC<OverlayWrapperProps> = ({
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
}) => {
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
