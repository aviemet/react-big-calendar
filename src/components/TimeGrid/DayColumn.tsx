import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import Selection, { getBoundsForNode, isEvent } from '@/utils/selection'
import TimeSlotGroup from './TimeSlotGroup'
import { useTimeSlotMetrics } from '@/hooks/useTimeSlotMetrics'
import { CalendarProps, useCalendarContext } from '@/Calendar'
import EventsWrapper from './EventsWrapper'
import { Resource } from '@/utils/Resources'
import { DayLayoutAlgorithm } from '@/utils/layout-algorithms/types'
import { CalendarEvent } from '@/utils/components'

interface DayColumnProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  events: TEvent[]
  backgroundEvents: TEvent[]
  step: number
  date: Date
  min: Date
  max: Date
  isNow: boolean
  resizable: boolean
  showMultiDayTimes: boolean
  culture: string
  timeslots: number
  selected: any
  selectable: boolean | 'ignoreEvents'
  eventOffset: number
  longPressThreshold: number
  onSelecting: CalendarProps['onSelecting']
  onSelectSlot: CalendarProps['onSelectSlot']
  onSelectEvent: CalendarProps['onSelectEvent']
  onDoubleClickEvent: CalendarProps['onDoubleClickEvent']
  onKeyPressEvent: CalendarProps['onKeyPressEvent']
  className: string
  dragThroughEvents: boolean
  resource: TResource
  dayLayoutAlgorithm: DayLayoutAlgorithm
}

const DayColumn = (props: DayColumnProps) => {
  let {
    events,
    backgroundEvents,
    step,
    date,
    min,
    max,
    isNow = false,
    resizable = false,
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

  const selectSlot = ({ startDate, endDate, action, bounds, box }:
  { startDate: Date, endDate: Date, action: string, bounds: any, box: any }
  ) => {
    let current = startDate
    const slots = []

    while(localizer.lte(current, endDate)) {
      slots.push(current)
      current = new Date(+current + step * 60 * 1000)
    }

    onSelectSlot({
      slots,
      start: startDate,
      end: endDate,
      resourceId: resource,
      action,
      bounds,
      box,
    })
  }

  return (
    <DayColumnWrapperComponent
      ref={ containerRef }
      date={ date }
      style={ getters.dayProp(max, resource).style }
      className={ clsx(
        getters.dayProp(max, resource).className,
        'rbc-day-slot',
        'rbc-time-column',
        {
          'rbc-now': isNow ,
          'rbc-today': isNow ,
          'rbc-slot-selecting': selecting,
        }
      ) }
      slotMetrics={ slotMetrics }
      resource={ resource }
    >
      { slotMetrics.groups.map((group, index) => (
        <TimeSlotGroup
          key={ index }
          group={ group }
          resource={ resource }
        />
      )) }
      <EventContainer
        resource={ resource }
        slotMetrics={ slotMetrics }
      >
        <div className={ clsx('rbc-events-container', { rtl }) }>
          <EventsWrapper
            events={ backgroundEvents }
            isBackgroundEvent={ true }
            selected={ selected }
            resource={ resource }
            step={ step }
            timeslots={ timeslots }
            dayLayoutAlgorithm={ dayLayoutAlgorithm }
            resizable={ resizable }
            slotMetrics={ slotMetrics }
            onSelectEvent={ onSelectEvent }
            onDoubleClickEvent={ onDoubleClickEvent }
            onKeyPressEvent={ onKeyPressEvent }
          />
          <EventsWrapper
            events={ events }
            rtl={ rtl }
            selected={ selected }
            resource={ resource }
            step={ step }
            timeslots={ timeslots }
            dayLayoutAlgorithm={ dayLayoutAlgorithm }
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
