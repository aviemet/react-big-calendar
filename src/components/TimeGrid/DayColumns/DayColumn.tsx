import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import { CalendarProps, useCalendarContext } from "@/Calendar"
import { useTimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"
import { CalendarEvent, SlotInfo } from "@/utils/components"
import { Selection, getBoundsForNode, isEvent } from "@/utils/selection"

import { EventsWrapper } from "../EventsWrapper"
import { TimeSlotGroup } from "../TimeSlotGroup"

interface DayColumnProps<TEvent extends CalendarEvent = CalendarEvent> {
  events: TEvent[]
  backgroundEvents: TEvent[]
  step: number
  date: Date
  min: Date
  max: Date
  isNow: boolean
  resizable?: boolean
  showMultiDayTimes: boolean
  timeslots: number
  selected: object
  selectable?: boolean | "ignoreEvents"
  eventOffset?: number
  longPressThreshold: number
  onSelecting?: CalendarProps["onSelecting"]
  onSelectSlot?: CalendarProps["onSelectSlot"]
  onSelectEvent?: CalendarProps["onSelectEvent"]
  onDoubleClickEvent?: CalendarProps["onDoubleClickEvent"]
  onKeyPressEvent?: CalendarProps["onKeyPressEvent"]
  className?: string
  dragThroughEvents?: boolean
  resourceId: string | number
}

const DayColumn = ({
  events,
  backgroundEvents,
  step = 30,
  date,
  min,
  max,
  isNow = false,
  resizable = false,
  timeslots = 2,
  selected,
  selectable,
  longPressThreshold,
  resourceId,
  onSelecting,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
}: DayColumnProps) => {

  const { localizer, getNow, getters, rtl, components: {
    dayColumnWrapper: DayColumnWrapperComponent,
    eventContainerWrapper: EventContainer,
  } } = useCalendarContext()

  const [selecting, setSelecting] = useState(false)
  const [timeIndicatorPosition, setTimeIndicatorPosition] = useState<number>(null)
  const [selectState, setSelectState] = useState<{
    top?: string
    height?: string
    startDate?: Date
    endDate?: Date
  }>({})

  const slotMetrics = useTimeSlotMetrics({ min, max, step, timeslots })

  const containerRef = useRef<HTMLDivElement>(null)
  const intervalTriggeredRef = useRef(false)
  const timeIndicatorTimeout = useRef<number>(null)
  const selectorRef = useRef<any>(null)
  const initialSlotRef = useRef<any>(null)

  useEffect(() => {
    if(selectable) {
      setupSelectable()
    }

    if(isNow) {
      setTimeIndicatorPositionUpdateInterval()
    }

    return () => {
      teardownSelectable()
      clearTimeIndicatorInterval()
    }
  }, [selectable, isNow])

  const teardownSelectable = () => {
    if(!selectorRef.current) return
    selectorRef.current.teardown()
    selectorRef.current = null
  }

  const setupSelectable = () => {
    if(!containerRef.current) return

    const selector = new Selection(() => containerRef.current, {
      longPressThreshold,
    })

    const selectionState = (point: any) => {
      let currentSlot = slotMetrics.closestSlotFromPoint(
        point,
        getBoundsForNode(containerRef.current)
      )

      if(!selecting) {
        initialSlotRef.current = currentSlot
      }

      let initialSlot = initialSlotRef.current

      if(localizer.lte(initialSlot, currentSlot)) {
        currentSlot = slotMetrics.nextSlot(currentSlot)
      } else if(localizer.gt(initialSlot, currentSlot)) {
        initialSlot = slotMetrics.nextSlot(initialSlot)
      }

      const selectRange = slotMetrics.getRange(
        localizer.min(initialSlot, currentSlot),
        localizer.max(initialSlot, currentSlot)
      )

      return {
        ...selectRange,
        selecting: true,
        top: `${selectRange.top}%`,
        height: `${selectRange.height}%`,
      }
    }

    const maybeSelect = (box: any) => {
      const state = selectionState(box)
      const { startDate: start, endDate: end } = state

      if(onSelecting) {
        if(
          (localizer.eq(selectState.startDate, start, "minutes") &&
            localizer.eq(selectState.endDate, end, "minutes")) ||
          onSelecting({ start, end, resourceId }) === false
        )
          return
      }

      setSelectState(state)
    }

    const selectorClicksHandler = (box: SlotInfo["box"], actionType: SlotInfo["action"]) => {
      if(!isEvent(containerRef.current, box)) {
        const { startDate, endDate } = selectionState(box)
        selectSlot({
          start: startDate,
          end: endDate,
          action: actionType,
          box,
        })
      }
      setSelecting(false)
    }

    selector.on("selecting", maybeSelect)
    selector.on("selectStart", maybeSelect)
    selector.on("beforeSelect", (box) => {
      if(selectable !== "ignoreEvents") return true
      return !isEvent(containerRef.current, box)
    })
    selector.on("click", (box) => selectorClicksHandler(box, "click"))
    selector.on("doubleClick", (box) => selectorClicksHandler(box, "doubleClick"))
    selector.on("select", (bounds) => {
      if(selecting) {
        selectSlot({ ...selectState, action: "select", bounds })
        setSelecting(false)
      }
    })
    selector.on("reset", () => {
      if(selecting) {
        setSelecting(false)
      }
    })

    selectorRef.current = selector
  }

  const positionTimeIndicator = () => {
    const current = getNow()

    if(current >= min && current <= max) {
      const top = slotMetrics.getCurrentTimePosition(current)
      intervalTriggeredRef.current = true
      setTimeIndicatorPosition(top)
    } else {
      clearTimeIndicatorInterval()
    }
  }

  const clearTimeIndicatorInterval = () => {
    intervalTriggeredRef.current = false
    window.clearTimeout(timeIndicatorTimeout.current)
  }

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  const setTimeIndicatorPositionUpdateInterval = (tail = false) => {
    if(!intervalTriggeredRef.current && !tail) {
      positionTimeIndicator()
    }

    timeIndicatorTimeout.current = window.setTimeout(() => {
      intervalTriggeredRef.current = true
      positionTimeIndicator()
      setTimeIndicatorPositionUpdateInterval()
    }, 60000)
  }

  const selectSlot = ({ start, end, action, bounds, box }: SlotInfo) => {
    let current = start
    const slots = []

    while(localizer.lte(current, end)) {
      slots.push(current)
      current = new Date(+current + step * 60 * 1000)
    }

    onSelectSlot({
      slots,
      start,
      end,
      resourceId,
      action,
      bounds,
      box,
    })
  }

  return (
    <DayColumnWrapperComponent
      ref={ containerRef }
      date={ date }
      style={ getters.dayProp(max, resourceId).style }
      className={ clsx(
        getters.dayProp(max, resourceId).className,
        "rbc-day-slot",
        "rbc-time-column",
        {
          "rbc-now": isNow,
          "rbc-today": isNow,
          "rbc-slot-selecting": selecting,
        }
      ) }
      slotMetrics={ slotMetrics }
      resourceId={ resourceId }
    >
      { slotMetrics.groups.map((group, index) => (
        <TimeSlotGroup
          key={ index }
          group={ group }
          resource={ resourceId }
        />
      )) }
      <EventContainer
        resourceId={ resourceId }
        slotMetrics={ slotMetrics }
      >
        <div className={ clsx("rbc-events-container", { rtl }) }>
          <EventsWrapper
            events={ backgroundEvents }
            isBackgroundEvent={ true }
            selected={ selected }
            resource={ resourceId }
            step={ step }
            timeslots={ timeslots }
            resizable={ resizable }
            slotMetrics={ slotMetrics }
            onSelectEvent={ onSelectEvent }
            onDoubleClickEvent={ onDoubleClickEvent }
            onKeyPressEvent={ onKeyPressEvent }
          />
          <EventsWrapper
            events={ events }
            selected={ selected }
            resource={ resourceId }
            step={ step }
            timeslots={ timeslots }
            resizable={ resizable }
            slotMetrics={ slotMetrics }
            onSelectEvent={ onSelectEvent }
            onDoubleClickEvent={ onDoubleClickEvent }
            onKeyPressEvent={ onKeyPressEvent }
          />
        </div>
      </EventContainer>

      { selecting && (
        <div
          className="rbc-slot-selection"
          style={ { top: selectState.top, height: selectState.height } }
        >
          <span>{ localizer.format(selectState, "selectRangeFormat") }</span>
        </div>
      ) }
      { isNow && intervalTriggeredRef.current && (
        <div
          className="rbc-current-time-indicator"
          style={ { top: `${timeIndicatorPosition}%` } }
        />
      ) }
    </DayColumnWrapperComponent>
  )

}

export { DayColumn }
