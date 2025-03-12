import { useEffect, useRef, useState } from "react"
import { coerceDate } from "@/utils/helpers"
import { dateCellSelection, getSlotAtX, pointInBox } from "@/utils/eventSelectionHelpers"
import { Selection, getBoundsForNode, isEvent, isShowMore } from "@/utils/selection"
import clsx from "clsx"
import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"

interface BackgroundCellsProps {
  container?: () => HTMLElement
  dayPropGetter?: (date: Date) => { className: string, style: React.CSSProperties }
  selectable?: boolean | "ignoreEvents"
  longPressThreshold?: number
  onSelectSlot: (range: Date[], slot: { start: number, end: number }) => void
  onSelectEnd?: (event: CalendarEvent) => void
  onSelectStart?: (event: CalendarEvent) => void
  range: Date[]
  type?: string
  resourceId?: string | number
}

const BackgroundCells = (props: BackgroundCellsProps) => {
  const {
    container,
    dayPropGetter,
    selectable,
    longPressThreshold,
    onSelectSlot,
    onSelectEnd,
    onSelectStart,
    range,
    type,
    resourceId,
  } = props
  const { localizer, rtl, getters, date, getNow, components: {
    dateCellWrapper: Wrapper,
  } } = useCalendarContext()

  const [selecting, setSelecting] = useState(false)
  const [selector, setSelector] = useState<Selection | null>(null)

  const [startIndex, setStartIndex] = useState(-1)
  const [endIndex, setEndIndex] = useState(-1)
  const [dateCellStart, setDateCellStart] = useState<{ x: number, y: number } | {}>()

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(selectable) initSelectable()
  }, [selectable])

  useEffect(() => {
    return destroySelectable
  }, [])

  const initSelectable = () => {
    setSelector(new Selection(container, {
      longPressThreshold: longPressThreshold,
    }))

    let selectorClicksHandler = (point, actionType) => {
      if(!isEvent(containerRef.current, point) && !isShowMore(containerRef.current, point)) {
        const rowBox = getBoundsForNode(containerRef.current)

        if(pointInBox(rowBox, point)) {
          let currentCell = getSlotAtX(rowBox, point.x, rtl, range.length)

          selectSlot({
            startIndex: currentCell,
            endIndex: currentCell,
            action: actionType,
            box: point,
          })
        }
      }

      setDateCellStart({})
      setSelecting(false)
    }

    selector.on("selecting", (box) => {
      if(!selecting) {
        onSelectStart?.(box)
        setDateCellStart({ x: box.x, y: box.y })
      }
      if(selector.isSelected(containerRef.current)) {
        let nodeBox = getBoundsForNode(containerRef.current)
        const selectionIndices = dateCellSelection(
          dateCellStart,
          nodeBox,
          box,
          range.length,
          rtl
        )
        setStartIndex(selectionIndices.startIndex)
        setEndIndex(selectionIndices.endIndex)
      }

      setSelecting(true)
      setStartIndex(selectionIndices.startIndex)
      setEndIndex(selectionIndices.endIndex)
    })

    selector.on("beforeSelect", (box) => {
      if(selectable !== "ignoreEvents") return

      return !isEvent(containerRef.current, box)
    })

    selector.on("click", (point) => selectorClicksHandler(point, "click"))

    selector.on("doubleClick", (point) =>
      selectorClicksHandler(point, "doubleClick")
    )

    selector.on("select", (bounds) => {
      selectSlot({ ...state, action: "select", bounds })
      setSelecting(false)
      onSelectEnd(...state)
      // notify(onSelectEnd, [state])
    })
  }

  const destroySelectable = () => {
    if(!selector) return
    selector.teardown()
    setSelector(null)
  }

  const selectSlot = ({ endIndex, startIndex, action, bounds, box }) => {
    if(endIndex !== -1 && startIndex !== -1) {
      onSelectSlot?.({
        start: startIndex,
        end: endIndex,
        action,
        bounds,
        box,
        resourceId: resourceId,
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
              className={ clsx(
                "rbc-day-bg",
                className,
                {
                  "rbc-selected-cell": selected,
                  "rbc-today": localizer.isSameDate(date, current),
                  "rbc-off-range-bg": current && localizer.neq(current, date, "month"),
                },
              ) }
            />
          </Wrapper>
        )
      }) }
    </div>
  )
}

export { BackgroundCells }
