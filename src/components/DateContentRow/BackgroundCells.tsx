import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import { useCalendarContext } from "@/Calendar"
import { Box, Point, dateCellSelection, getSlotAtX, pointInBox } from "@/utils/eventSelectionHelpers"
import { coerceDate } from "@/utils/helpers"
import { Selection, getBoundsForNode, isEvent, isShowMore } from "@/utils/selection"

export interface SelectSlotInfo {
  start: number
  end: number
  action: "select" | "click" | "doubleClick"
  bounds?: Box
  box?: Point
  resourceId?: string | number
}

type DateCellStartState =
  | { selecting: true, position: Box }
  | { selecting: false, position: undefined }

interface BackgroundCellsProps {
  container?: () => HTMLElement
  selectable?: boolean | "ignoreEvents"
  longPressThreshold?: number
  onSelectSlot: (slot: SelectSlotInfo) => void
  onSelectEnd?: (state: {
    startIndex: number
    endIndex: number
    action?: "select" | "click" | "doubleClick"
    bounds?: Box
  }) => void
  onSelectStart?: (box: Box) => void
  range: Date[]
  resourceId?: string | number
}

const BackgroundCells = (props: BackgroundCellsProps) => {
  const {
    container,
    selectable,
    longPressThreshold,
    onSelectSlot,
    onSelectEnd,
    onSelectStart,
    range,
    resourceId,
  } = props
  const { localizer, rtl, getters, date, getNow, components: {
    dateCellWrapper: Wrapper,
  } } = useCalendarContext()

  const [selecting, setSelecting] = useState(false)
  const [startIndex, setStartIndex] = useState(-1)
  const [endIndex, setEndIndex] = useState(-1)
  const [dateCellState, setDateCellState] = useState<DateCellStartState>({
    selecting: false,
    position: undefined,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const selectorRef = useRef<Selection | null>(null)

  useEffect(() => {
    if(selectable) {
      selectorRef.current = new Selection(container, {
        longPressThreshold: longPressThreshold,
      })
      initSelectable()
    }
    return destroySelectable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectable])

  const initSelectable = () => {
    const selector = selectorRef.current
    if(!selector) return

    const selectorClicksHandler = (point: Point, actionType: "click" | "doubleClick") => {
      if(!isEvent(containerRef.current, point) && !isShowMore(containerRef.current, point)) {
        const rowBox = getBoundsForNode(containerRef.current)

        if(pointInBox(rowBox, point)) {
          const currentCell = getSlotAtX(rowBox, point.x, rtl, range.length)

          selectSlot({
            start: currentCell,
            end: currentCell,
            action: actionType,
            box: point,
          })
        }
      }

      setDateCellState({ selecting: false, position: undefined })
      setSelecting(false)
    }

    selector.on("selecting", (box: Box) => {
      let selectionIndices = { startIndex: -1, endIndex: -1 }

      if(!selecting) {
        onSelectStart?.(box)
        setDateCellState({
          selecting: true,
          position: box,
        })
      }

      if(selector.isSelected(containerRef.current)) {
        const nodeBox = getBoundsForNode(containerRef.current)
        // Only call dateCellSelection when we have a valid position
        if(dateCellState.selecting) {
          selectionIndices = dateCellSelection(
            dateCellState.position,
            nodeBox,
            box,
            range.length,
            rtl
          )
        }
      }

      setSelecting(true)
      setStartIndex(selectionIndices.startIndex)
      setEndIndex(selectionIndices.endIndex)
    })

    selector.on("beforeSelect", (box: Box) => {
      if(selectable !== "ignoreEvents") return true

      return !isEvent(containerRef.current, box)
    })

    selector.on("click", (point: Point) => selectorClicksHandler(point, "click"))

    selector.on("doubleClick", (point: Point) =>
      selectorClicksHandler(point, "doubleClick")
    )

    selector.on("select", (bounds: Box) => {
      selectSlot({
        start: startIndex,
        end: endIndex,
        action: "select",
        bounds,
      })
      setSelecting(false)
      onSelectEnd?.({
        startIndex,
        endIndex,
        action: "select",
        bounds,
      })
    })
  }

  const destroySelectable = () => {
    if(!selectorRef.current) return
    selectorRef.current.teardown()
    selectorRef.current = null
  }

  const selectSlot = ({
    start,
    end,
    action,
    bounds,
    box,
  }: SelectSlotInfo) => {
    if(end !== -1 && start !== -1) {
      onSelectSlot({
        start,
        end,
        action,
        bounds,
        box,
        resourceId,
      })
    }
  }

  const current = coerceDate(date || getNow())

  return (
    <div className="rbc-row-bg" ref={ containerRef }>
      { range.map((date, index) => {
        let selected = selecting && index >= startIndex && index <= endIndex
        const { className, style } = getters.dayProp(date)

        return (
          <Wrapper key={ index } value={ date } range={ range }>
            <div
              style={ style }
              className={ clsx("rbc-day-bg", className, {
                "rbc-selected-cell": selected,
                "rbc-today": localizer.isSameDate(date, current),
                "rbc-off-range-bg": current && localizer.neq(current, date, "month"),
              }) }
            />
          </Wrapper>
        )
      }) }
    </div>
  )
}

export { BackgroundCells }
