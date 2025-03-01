import { useEffect, useMemo, useRef, useState } from 'react'

import Selection, { getBoundsForNode, isEvent } from '@/utils/Selection'
import * as TimeSlotUtils from '@/utils/TimeSlots'
import { isSelected } from '@/utils/eventSelectionHelpers'
import { notify } from '@/utils/helpers'
import * as DayEventLayout from '@/utils/DayEventLayout'
import TimeSlotGroup from '@/TimeSlotGroup'
import TimeGridEvents from './TimeGridEvents'
import DayColumnWrapper from '@/DayColumnWrapper'
import { useCalendarContext } from '@/components/Calendar'
import { Accessors, Getters } from '@/types'

import clsx from 'clsx'

interface DayColumnProps {
  events: Event[]
  backgroundEvents: Event[]
  step: number
  date: Date
  min: Date
  max: Date
  getNow: () => Date
  isNow: boolean
  rtl: boolean
  resizable: boolean
  accessors: Accessors
  getters: Getters
  showMultiDayTimes: boolean
  culture: string
  timeslots: number
  selected: any
  selectable: boolean | 'ignoreEvents'
  eventOffset: number
  longPressThreshold: number
  onSelecting: (args: any) => void
  onSelectSlot: (args: any) => void
  onSelectEvent: (args: any) => void
  onDoubleClickEvent: (args: any) => void
  onKeyPressEvent: (args: any) => void
  className: string
  dragThroughEvents: boolean
  resource: any
  dayLayoutAlgorithm: any
}


const DayColumn = (props: DayColumnProps) => {
  let {
    events,
    backgroundEvents,
    step,
    date,
    min,
    max,
    getNow,
    isNow = false,
    rtl = false,
    resizable = false,
    accessors,
    getters,
    timeslots = 2,
    selected,
    selectable,
    longPressThreshold,
    resource,
    onSelecting,
    onSelectSlot,
    onSelectEvent,
    onDoubleClickEvent,
    onKeyPressEvent,
    dayLayoutAlgorithm,
  } = props

  const { localizer, components } = useCalendarContext()

  const [selecting, setSelecting] = useState(false)
  const [timeIndicatorPosition, setTimeIndicatorPosition] = useState<number>(null)
  const [selectState, setSelectState] = useState<{
    top?: string
    height?: string
    startDate?: Date
    endDate?: Date
  }>({})

  const slotMetrics = useMemo(
    () => TimeSlotUtils.getSlotMetrics({ min, max, step, timeslots, localizer }),
    [min, max, step, timeslots, localizer]
  )

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
      const currentSlot = slotMetrics.closestSlotFromPoint(
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
          (localizer.eq(selectState.startDate, start, 'minutes') &&
            localizer.eq(selectState.endDate, end, 'minutes')) ||
          onSelecting({ start, end, resourceId: resource }) === false
        )
          return
      }

      setSelectState(state)
    }

    const selectorClicksHandler = (box: any, actionType: string) => {
      if(!isEvent(containerRef.current, box)) {
        const { startDate, endDate } = selectionState(box)
        selectSlot({
          startDate,
          endDate,
          action: actionType,
          box,
        })
      }
      setSelecting(false)
    }

    selector.on('selecting', maybeSelect)
    selector.on('selectStart', maybeSelect)
    selector.on('beforeSelect', (box) => {
      if(selectable !== 'ignoreEvents') return true
      return !isEvent(containerRef.current, box)
    })
    selector.on('click', (box) => selectorClicksHandler(box, 'click'))
    selector.on('doubleClick', (box) => selectorClicksHandler(box, 'doubleClick'))
    selector.on('select', (bounds) => {
      if(selecting) {
        selectSlot({ ...selectState, action: 'select', bounds })
        setSelecting(false)
      }
    })
    selector.on('reset', () => {
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

  const selectSlot = ({ startDate, endDate, action, bounds, box }) => {
    let current = startDate
    const slots = []

    while(localizer.lte(current, endDate)) {
      slots.push(current)
      current = new Date(+current + step * 60 * 1000)
    }

    notify(onSelectSlot, {
      slots,
      start: startDate,
      end: endDate,
      resourceId: resource,
      action,
      bounds,
      box,
    })
  }

  // const renderEvents = ({ events, isBackgroundEvent = false }: { events: Event[], isBackgroundEvent: boolean }) => {
  //   const styledEvents = DayEventLayout.getStyledEvents({
  //     events,
  //     accessors,
  //     slotMetrics,
  //     minimumStartDifference: Math.ceil((step * timeslots) / 2),
  //     dayLayoutAlgorithm,
  //   })

  //   return styledEvents.map(({ event, style }, idx) => {
  //     const end = accessors.end(event)
  //     const start = accessors.start(event)
  //     const key = accessors.eventId(event) ?? `evt_${idx}`
  //     let format = 'eventTimeRangeFormat'
  //     let label

  //     const startsBeforeDay = slotMetrics.startsBeforeDay(start)
  //     const startsAfterDay = slotMetrics.startsAfterDay(end)

  //     if(startsBeforeDay) format = 'eventTimeRangeEndFormat'
  //     else if(startsAfterDay) format = 'eventTimeRangeStartFormat'

  //     if(startsBeforeDay && startsAfterDay) label = localizer.messages.allDay
  //     else label = localizer.format({ start, end }, format)

  //     const continuesPrior = startsBeforeDay || slotMetrics.startsBefore(start)
  //     const continuesAfter = startsAfterDay || slotMetrics.startsAfter(end)

  //     return (
  //       <TimeGridEvent
  //         style={ style }
  //         event={ event }
  //         label={ label }
  //         key={ key }
  //         getters={ getters }
  //         rtl={ rtl }
  //         components={ components }
  //         continuesPrior={ continuesPrior }
  //         continuesAfter={ continuesAfter }
  //         accessors={ accessors }
  //         resource={ resource }
  //         selected={ isSelected(event, selected) }
  //         onClick={ (e) => notify(onSelectEvent, event, e) }
  //         onDoubleClick={ (e) => notify(onDoubleClickEvent, event, e) }
  //         onKeyPress={ (e) => notify(onKeyPressEvent, event, e) }
  //         isBackgroundEvent={ isBackgroundEvent }
  //         resizable={ resizable }
  //       />
  //     )
  //   })
  // }

  const DayColumnWrapperComponent = components.dayColumnWrapper || DayColumnWrapper

  return (
    <DayColumnWrapperComponent
      ref={ containerRef }
      date={ date }
      style={ getters.dayProp(max, resource).style }
      className={ clsx(
        getters.dayProp(max, resource).className,
        'rbc-day-slot',
        'rbc-time-column',
        isNow && 'rbc-now',
        isNow && 'rbc-today',
        selecting && 'rbc-slot-selecting'
      ) }
      slotMetrics={ slotMetrics }
      resource={ resource }
    >
      { slotMetrics.groups.map((grp, idx) => (
        <TimeSlotGroup
          key={ idx }
          group={ grp }
          resource={ resource }
          getters={ getters }
          components={ components }
        />
      )) }
      <div className={ clsx('rbc-events-container', rtl && 'rtl') }>
        <TimeGridEvents
          events={ backgroundEvents }
          isBackgroundEvent={ true }
          accessors={ accessors }
          slotMetrics={ slotMetrics }
          minimumStartDifference={ Math.ceil((step * timeslots) / 2) }
          dayLayoutAlgorithm={ dayLayoutAlgorithm }
        />
        <TimeGridEvents
          events={ events }
          accessors={ accessors }
          slotMetrics={ slotMetrics }
          minimumStartDifference={ Math.ceil((step * timeslots) / 2) }
          dayLayoutAlgorithm={ dayLayoutAlgorithm }
        />
      </div>

      { selecting && (
        <div
          className="rbc-slot-selection"
          style={ { top: selectState.top, height: selectState.height } }
        >
          <span>{ localizer.format(selectState, 'selectRangeFormat') }</span>
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


export default DayColumn
