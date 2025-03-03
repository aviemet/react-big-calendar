import React from 'react'
import clsx from 'clsx'
import scrollbarSize from 'dom-helpers/scrollbarSize'
import DateContentRow from '@/components/DateContentRow'
import Header from '@/Header'
import ResourceHeader from '@/ResourceHeader'
import { notify } from '@/utils/helpers'
import { CalendarEvent, Components, Getters } from '@/types'
import { Resource } from '@/utils/Resources'
import { DateLocalizer } from '@/localizers'
import { Accessors } from '@/utils/accessors'
import { useCalendarContext } from '@/Calendar'

// TimeGridHeaderResources.propTypes = {
//   range: PropTypes.array.isRequired,
//   events: PropTypes.array.isRequired,
//   resources: PropTypes.object,
//   getNow: PropTypes.func.isRequired,
//   isOverflowing: PropTypes.bool,

//   rtl: PropTypes.bool,
//   resizable: PropTypes.bool,
//   width: PropTypes.number,

//   localizer: PropTypes.object.isRequired,
//   accessors: PropTypes.object.isRequired,
//   components: PropTypes.object.isRequired,
//   getters: PropTypes.object.isRequired,

//   selected: PropTypes.object,
//   selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
//   longPressThreshold: PropTypes.number,

//   allDayMaxRows: PropTypes.number,

//   onSelectSlot: PropTypes.func,
//   onSelectEvent: PropTypes.func,
//   onDoubleClickEvent: PropTypes.func,
//   onKeyPressEvent: PropTypes.func,
//   onDrillDown: PropTypes.func,
//   onShowMore: PropTypes.func,
//   getDrilldownView: PropTypes.func.isRequired,
//   scrollRef: PropTypes.any,
// }

interface TimeGridHeaderResourcesProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  range: Date[]
  events: TEvent[]
  resources: TResource[]
  getNow: () => Date
  isOverflowing: boolean
  rtl: boolean
  resizable: boolean
  width: number
  localizer: DateLocalizer
  accessors: Accessors
  components: Components
  getters: Getters
  selected: TEvent
  selectable: boolean | 'ignoreEvents'
  longPressThreshold: number
  allDayMaxRows: number
  onSelectSlot: (slot: Date[]) => void
  onSelectEvent: (event: TEvent) => void
  onDoubleClickEvent: (event: TEvent) => void
  onKeyPressEvent: (event: TEvent) => void
  onDrillDown: (date: Date, view: string) => void
  onShowMore: (events: TEvent[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
  getDrilldownView: (date: Date) => string
  scrollRef: React.RefObject<HTMLDivElement>
}

const TimeGridHeaderResources = ({
  width,
  rtl,
  range,
  scrollRef,
  isOverflowing,
  components,
  getters,
  selected,
  selectable,
  longPressThreshold,
  allDayMaxRows,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onShowMore,
  onDrillDown,
  getDrilldownView,
  getNow,
  resources,
  accessors,
  events,
  resizable,
}: TimeGridHeaderResourcesProps) => {
  const { timeGutterHeader: TimeGutterHeader } = components

  let style = {}
  if(isOverflowing) {
    style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize() - 1}px`
  }

  return (
    <div
      style={ style }
      ref={ scrollRef }
      className={ clsx('rbc-time-header', isOverflowing && 'rbc-overflowing') }
    >
      <div
        className="rbc-label rbc-time-header-gutter"
        style={ { width, minWidth: width, maxWidth: width } }
      >
        { TimeGutterHeader && <TimeGutterHeader /> }
      </div>

      <HeaderCells
        range={ range }
        getDrilldownView={ getDrilldownView }
        getNow={ getNow }
        getters={ getters }
        components={ components }
        resources={ resources }
        accessors={ accessors }
        events={ events }
        rtl={ rtl }
        selectable={ selectable }
        resizable={ resizable }
        allDayMaxRows={ allDayMaxRows }
        onSelectSlot={ onSelectSlot }
        onSelectEvent={ onSelectEvent }
        onDoubleClickEvent={ onDoubleClickEvent }
        onKeyPressEvent={ onKeyPressEvent }
        onShowMore={ onShowMore }
        onDrillDown={ onDrillDown }
        longPressThreshold={ longPressThreshold }
      />
    </div>
  )

}


export default TimeGridHeaderResources

interface HeaderCellsProps {
  range: Date[]
  getDrilldownView: (date: Date) => string
  getNow: () => Date
  getters: Getters
  components: Components
  resources: Resource[]
  accessors: Accessors
  events: CalendarEvent[]
  rtl: boolean
  selectable: boolean
  resizable: boolean
  onSelectSlot: (slot: Date[]) => void
  onSelectEvent: (event: CalendarEvent) => void
  onDoubleClickEvent: (event: CalendarEvent) => void
  onKeyPressEvent: (event: CalendarEvent) => void
  onShowMore: (events: CalendarEvent[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
  allDayMaxRows: number
  longPressThreshold: number
  onDrillDown: (date: Date, view: string) => void
}

const HeaderCells = ({
  range,
  getDrilldownView,
  getNow,
  getters: { dayProp },
  components,
  resources,
  accessors,
  events,
  rtl,
  selectable,
  getters,
  resizable,
  allDayMaxRows,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onShowMore,
  longPressThreshold,
  onDrillDown,
}: HeaderCellsProps) => {
  const { localizer } = useCalendarContext()

  const {
    header: HeaderComponent = Header,
    resourceHeader: ResourceHeaderComponent = ResourceHeader,
  } = components

  const handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    notify(onDrillDown, [date, view])
  }

  const today = getNow()

  const groupedEvents = resources.groupEvents(events)

  return range.map((date, Index) => {
    let drilldownView = getDrilldownView(date)
    let label = localizer.format(date, 'dayFormat')

    const { className, style } = dayProp(date)

    let header = (
      <HeaderComponent date={ date } label={ label } localizer={ localizer } />
    )

    return (
      <div
        key={ Index }
        className="rbc-time-header-content rbc-resource-grouping"
      >
        <div
          className={ `rbc-row rbc-time-header-cell${
            range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
          }` }
        >
          <div
            style={ style }
            className={ clsx(
              'rbc-header',
              className,
              localizer.isSameDate(date, today) && 'rbc-today'
            ) }
          >
            { drilldownView
              ? (
                <button
                  type="button"
                  className="rbc-button-link"
                  onClick={ (e) =>
                    handleHeaderClick(date, drilldownView, e)
                  }
                >
                  { header }
                </button>
              )
              : (
                <span>{ header }</span>
              ) }
          </div>
        </div>

        <div className="rbc-row">
          { resources.map(([id, resource], Index) => {
            return (
              <div
                key={ `resource_${id}_${Index}` }
                className={ clsx(
                  'rbc-header',
                  className,
                  localizer.isSameDate(date, today) && 'rbc-today'
                ) }
              >
                <ResourceHeaderComponent
                  index={ Index }
                  label={ accessors.resourceTitle(resource) }
                  resource={ resource }
                />
              </div>
            )
          }) }
        </div>

        <div className="rbc-row rbc-m-b-negative-3 rbc-h-full">
          { resources.map(([id, resource], Index) => {
            // Filter the grouped events by the current date.
            const filteredEvents = (groupedEvents.get(id) || []).filter(
              (event) =>
                localizer.isSameDate(event.start, date) ||
                localizer.isSameDate(event.end, date)
            )

            return (
              <DateContentRow
                key={ `resource_${id}_${Index}` }
                isAllDay
                rtl={ rtl }
                getNow={ getNow }
                minRows={ 2 }
                maxRows={ allDayMaxRows + 1 }
                range={ [date] } // This ensures that only the single day is rendered
                events={ filteredEvents } // Only show filtered events for this day.
                resourceId={ resource && id }
                className="rbc-allday-cell"
                selectable={ selectable }
                selected={ selected }
                components={ components }
                accessors={ accessors }
                getters={ getters }
                onSelect={ onSelectEvent }
                onShowMore={ onShowMore }
                onDoubleClick={ onDoubleClickEvent }
                onKeyDown={ onKeyPressEvent }
                onSelectSlot={ onSelectSlot }
                longPressThreshold={ longPressThreshold }
                resizable={ resizable }
              />
            )
          }) }
        </div>
      </div>
    )
  })
}
