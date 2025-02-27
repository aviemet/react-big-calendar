import React, { createRef, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Selection, { getBoundsForNode, isEvent } from './utils/Selection'
import * as TimeSlotUtils from './utils/TimeSlots'
import { isSelected } from './utils/eventSelectionHelpers'

import { notify } from './utils/helpers'
import * as DayEventLayout from './utils/DayEventLayout'
import TimeSlotGroup from './TimeSlotGroup'
import TimeGridEvent from './Views/TimeGridView/TimeGridEvent'

import DayColumnWrapper from './DayColumnWrapper'
import { useCalendarContext } from './components/Calendar'

// DayColumn.propTypes = {
//   events: PropTypes.array.isRequired,
//   backgroundEvents: PropTypes.array.isRequired,
//   step: PropTypes.number.isRequired,
//   date: PropTypes.instanceOf(Date).isRequired,
//   min: PropTypes.instanceOf(Date).isRequired,
//   max: PropTypes.instanceOf(Date).isRequired,
//   getNow: PropTypes.func.isRequired,
//   isNow: PropTypes.bool,

//   rtl: PropTypes.bool,
//   resizable: PropTypes.bool,

//   accessors: PropTypes.object.isRequired,
//   components: PropTypes.object.isRequired,
//   getters: PropTypes.object.isRequired,
//   localizer: PropTypes.object.isRequired,

//   showMultiDayTimes: PropTypes.bool,
//   culture: PropTypes.string,
//   timeslots: PropTypes.number,

//   selected: PropTypes.object,
//   selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
//   eventOffset: PropTypes.number,
//   longPressThreshold: PropTypes.number,

//   onSelecting: PropTypes.func,
//   onSelectSlot: PropTypes.func.isRequired,
//   onSelectEvent: PropTypes.func.isRequired,
//   onDoubleClickEvent: PropTypes.func.isRequired,
//   onKeyPressEvent: PropTypes.func,

//   className: PropTypes.string,
//   dragThroughEvents: PropTypes.bool,
//   resource: PropTypes.any,

//   dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
// }

// DayColumn.defaultProps = {
//   dragThroughEvents: true,
//   timeslots: 2,
// }

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
  accessors: any
  components: any
  getters: any
  localizer: any
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
    rtl,
    selected,
    selectable,
    accessors,
    getters,
    step,
    timeslots,
    dayLayoutAlgorithm,
    resizable,
    isNow
  } = props

  const { localizer, components } = useCalendarContext()

  const [selecting, setSelecting] = useState(false)
  const [timeIndicatorPosition, setTimeIndicatorPosition] = useState<number | null>(null)
  const intervalTriggered = useRef(false)

  const slotMetrics = TimeSlotUtils.getSlotMetrics(props)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    selectable && _selectable()

    if(isNow) {
      setTimeIndicatorPositionUpdateInterval()
    }

    return () => {
      _teardownSelectable()
      clearTimeIndicatorInterval()
    }
  }, [])

  useEffect(() => {

  }, [])

  componentDidUpdate(prevProps, prevState) {
    if(props.selectable && !prevProps.selectable) _selectable()
    if(!props.selectable && prevProps.selectable)
      _teardownSelectable()

    const { getNow, isNow, localizer, date, min, max } = props
    const getNowChanged = localizer.neq(prevProps.getNow(), getNow(), 'minutes')

    if(prevProps.isNow !== isNow || getNowChanged) {
      clearTimeIndicatorInterval()

      if(isNow) {
        const tail =
          !getNowChanged &&
          localizer.eq(prevProps.date, date, 'minutes') &&
          prevState.timeIndicatorPosition === state.timeIndicatorPosition

        setTimeIndicatorPositionUpdateInterval(tail)
      }
    } else if(
      isNow &&
      (localizer.neq(prevProps.min, min, 'minutes') ||
        localizer.neq(prevProps.max, max, 'minutes'))
    ) {
      positionTimeIndicator()
    }
  }

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  setTimeIndicatorPositionUpdateInterval(tail = false) {
    if(!intervalTriggered && !tail) {
      positionTimeIndicator()
    }

    _timeIndicatorTimeout = window.setTimeout(() => {
      intervalTriggered = true
      positionTimeIndicator()
      setTimeIndicatorPositionUpdateInterval()
    }, 60000)
  }

  clearTimeIndicatorInterval() {
    intervalTriggered = false
    window.clearTimeout(_timeIndicatorTimeout)
  }

  positionTimeIndicator() {
    const { min, max, getNow } = props
    const current = getNow()

    if(current >= min && current <= max) {
      const top = slotMetrics.getCurrentTimePosition(current)
      intervalTriggered = true
      setState({ timeIndicatorPosition: top })
    } else {
      clearTimeIndicatorInterval()
    }
  }

  renderEvents = ({ events, isBackgroundEvent }) => {

    const { messages } = localizer

    let styledEvents = DayEventLayout.getStyledEvents({
      events,
      accessors,
      slotMetrics,
      minimumStartDifference: Math.ceil((step * timeslots) / 2),
      dayLayoutAlgorithm,
    })

    return styledEvents.map(({ event, style }, Index) => {
      let end = accessors.end(event)
      let start = accessors.start(event)
      let key = accessors.eventId(event) ?? 'evt_' + Index
      let format = 'eventTimeRangeFormat'
      let label

      const startsBeforeDay = slotMetrics.startsBeforeDay(start)
      const startsAfterDay = slotMetrics.startsAfterDay(end)

      if(startsBeforeDay) format = 'eventTimeRangeEndFormat'
      else if(startsAfterDay) format = 'eventTimeRangeStartFormat'

      if(startsBeforeDay && startsAfterDay) label = messages.allDay
      else label = localizer.format({ start, end }, format)

      let continuesPrior = startsBeforeDay || slotMetrics.startsBefore(start)
      let continuesAfter = startsAfterDay || slotMetrics.startsAfter(end)

      return (
        <TimeGridEvent
          style={ style }
          event={ event }
          label={ label }
          key={ key }
          getters={ getters }
          rtl={ rtl }
          components={ components }
          continuesPrior={ continuesPrior }
          continuesAfter={ continuesAfter }
          accessors={ accessors }
          resource={ props.resource }
          selected={ isSelected(event, selected) }
          onClick={ (e) =>
            _select(
              {
                ...event,
                ...(props.resource && {
                  sourceResource: props.resource,
                }),
                ...(isBackgroundEvent && { isBackgroundEvent: true }),
              },
              e
            )
          }
          onDoubleClick={ (e) => _doubleClick(event, e) }
          isBackgroundEvent={ isBackgroundEvent }
          onKeyPress={ (e) => _keyPress(event, e) }
          resizable={ resizable }
        />
      )
    })
  }

  _selectable = () => {
    let node = containerRef.current
    const { longPressThreshold, localizer } = props
    let selector = (_selector = new Selection(() => node, {
      longPressThreshold: longPressThreshold,
    }))

    let maybeSelect = (box) => {
      let onSelecting = props.onSelecting
      let current = state || {}
      let state = selectionState(box)
      let { startDate: start, endDate: end } = state

      if(onSelecting) {
        if(
          (localizer.eq(current.startDate, start, 'minutes') &&
            localizer.eq(current.endDate, end, 'minutes')) ||
          onSelecting({ start, end, resourceId: props.resource }) === false
        )
          return
      }

      if(
        state.start !== state.start ||
        state.end !== state.end ||
        state.selecting !== state.selecting
      ) {
        setState(state)
      }
    }

    let selectionState = (point) => {
      let currentSlot = slotMetrics.closestSlotFromPoint(
        point,
        getBoundsForNode(node)
      )

      if(!state.selecting) {
        _initialSlot = currentSlot
      }

      let initialSlot = _initialSlot
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

    let selectorClicksHandler = (box, actionType) => {
      if(!isEvent(containerRef.current, box)) {
        const { startDate, endDate } = selectionState(box)
        _selectSlot({
          startDate,
          endDate,
          action: actionType,
          box,
        })
      }
      setState({ selecting: false })
    }

    selector.on('selecting', maybeSelect)
    selector.on('selectStart', maybeSelect)

    selector.on('beforeSelect', (box) => {
      if(props.selectable !== 'ignoreEvents') return

      return !isEvent(containerRef.current, box)
    })

    selector.on('click', (box) => selectorClicksHandler(box, 'click'))

    selector.on('doubleClick', (box) =>
      selectorClicksHandler(box, 'doubleClick')
    )

    selector.on('select', (bounds) => {
      if(state.selecting) {
        _selectSlot({ ...state, action: 'select', bounds })
        setState({ selecting: false })
      }
    })

    selector.on('reset', () => {
      if(state.selecting) {
        setState({ selecting: false })
      }
    })
  }

  _teardownSelectable = () => {
    if(!_selector) return
    _selector.teardown()
    _selector = null
  }

  _selectSlot = ({ startDate, endDate, action, bounds, box }) => {
    let current = startDate,
        slots = []

    while(props.localizer.lte(current, endDate)) {
      slots.push(current)
      current = new Date(+current + props.step * 60 * 1000) // using Date ensures not to create an endless loop the day DST begins
    }

    notify(props.onSelectSlot, {
      slots,
      start: startDate,
      end: endDate,
      resourceId: props.resource,
      action,
      bounds,
      box,
    })
  }

  _select = (...args) => {
    notify(props.onSelectEvent, args)
  }

  _doubleClick = (...args) => {
    notify(props.onDoubleClickEvent, args)
  }

  _keyPress = (...args) => {
    notify(props.onKeyPressEvent, args)
  }
  
    const {
      date,
      max,
      rtl,
      isNow,
      resource,
      accessors,
      localizer,
      getters: { dayProp, ...getters },
      components: { eventContainerWrapper: EventContainer, ...components },
    } = props

    slotMetrics = slotMetrics.update(props)

    let { slotMetrics } = this
    let { selecting, top, height, startDate, endDate } = state

    let selectDates = { start: startDate, end: endDate }

    const { className, style } = dayProp(max, resource)

    const DayColumnWrapperComponent =
      components.dayColumnWrapper || DayColumnWrapper

    return (
      <DayColumnWrapperComponent
        ref={ containerRef }
        date={ date }
        style={ style }
        className={ clsx(
          className,
          'rbc-day-slot',
          'rbc-time-column',
          isNow && 'rbc-now',
          isNow && 'rbc-today', // WHY
          selecting && 'rbc-slot-selecting'
        ) }
        slotMetrics={ slotMetrics }
        resource={ resource }
      >
        { slotMetrics.groups.map((grp, Index) => (
          <TimeSlotGroup
            key={ Index }
            group={ grp }
            resource={ resource }
            getters={ getters }
            components={ components }
          />
        )) }
        <EventContainer
          localizer={ localizer }
          resource={ resource }
          accessors={ accessors }
          getters={ getters }
          components={ components }
          slotMetrics={ slotMetrics }
        >
          <div className={ clsx('rbc-events-container', rtl && 'rtl') }>
            { renderEvents({
              events: props.backgroundEvents,
              isBackgroundEvent: true,
            }) }
            { renderEvents({ events: props.events }) }
          </div>
        </EventContainer>

        { selecting && (
          <div className="rbc-slot-selection" style={ { top, height } }>
            <span>{ localizer.format(selectDates, 'selectRangeFormat') }</span>
          </div>
        ) }
        { isNow && intervalTriggered && (
          <div
            className="rbc-current-time-indicator"
            style={ { top: `${state.timeIndicatorPosition}%` } }
          />
        ) }
      </DayColumnWrapperComponent>
    )
  

}


export default DayColumn
