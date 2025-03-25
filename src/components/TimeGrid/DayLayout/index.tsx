import { CalendarEvent } from "@/utils/components"
import { Resource, ResourceManager } from "@/utils/Resources"
import React from "react"
import { TimeGridHeader } from "../TimeGridHeader"
import { PopOverlay } from "@/components/PopOverlay"
import { useTimeGridContext } from ".."
import { DayColumnWrapper } from "../DayColumnWrapper"

export interface DayLayoutProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  headerProps: {
    range: Date[]
    events: TEvent[]
    width: number
    selected: any
    allDayMaxRows: number
    resources: typeof ResourceManager
    selectable: boolean
    scrollRef: React.RefObject<HTMLElement>
    isOverflowing: boolean
    longPressThreshold: number
    onSelectSlot: (event: TEvent) => void
    onSelectEvent: (event: TEvent) => void
    onShowMore: () => void
    onDoubleClickEvent: (event: TEvent, e: React.MouseEvent<HTMLElement>) => void
    onKeyPressEvent: (event: TEvent) => void
    onDrillDown: () => void
    getDrilldownView: () => React.ReactNode
    resizable: boolean
  }
  popup?: boolean
}

const DayLayout = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>({
  headerProps,
  popup,
}: DayLayoutProps<TEvent, TResource>) => {
  const { timeGridState, timeGridDispatch } = useTimeGridContext()

  return (
    <>
      <TimeGridHeader { ...headerProps } />

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

        { range.map((date) => {
          return (
            <div style={ { display: "flex", minHeight: "100%", flex: 1 } } key={ date.toISOString() }>
              { resourceManager.map(([id, resource]) => (
                <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
                  <DayColumnWrapper
                    date={ date }
                    id={ id }
                    resource={ resource }
                    groupedEvents={ groupedEvents }
                    groupedBackgroundEvents={ groupedBackgroundEvents }
                    min={ min }
                    max={ max }
                  />
                </div>
              )) }
            </div>
          )
        }) }
      </div>
    </>
  )
}

export { DayLayout }
