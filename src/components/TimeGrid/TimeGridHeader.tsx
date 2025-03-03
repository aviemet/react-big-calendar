
import clsx from 'clsx'
import scrollbarSize from 'dom-helpers/scrollbarSize'
import React from 'react'

import DateContentRow from '@/components/DateContentRow'
import Header from '@/Header'
import ResourceHeader from '@/ResourceHeader'
import { notify } from '@/utils/helpers'
import { CalendarEvent, Components, Getters } from '@/types'
import { Accessors } from '@/utils/accessors'
import { DateLocalizer } from '@/localizers'
import { Resource } from '@/utils/Resources'
import { useCalendarContext } from '@/Calendar'

interface TimeGridHeaderProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
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

const TimeGridHeader = ({
  width,
  rtl,
  resources,
  range,
  events,
  getNow,
  accessors,
  selectable,
  components,
  getters,
  scrollRef,
  isOverflowing,
  resizable,
  allDayMaxRows,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,
  onShowMore,
  getDrilldownView,
  longPressThreshold,
  selected,
}: TimeGridHeaderProps) => {
  const {
    timeGutterHeader: TimeGutterHeader,
    resourceHeader: ResourceHeaderComponent = ResourceHeader,
  } = components

  let style = {}
  if(isOverflowing) {
    style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize() - 1}px`
  }

  const groupedEvents = resources.groupEvents(events)

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

      { resources.map(([id, resource], Index) => (
        <div className="rbc-time-header-content" key={ id || Index }>
          { resource && (
            <div className="rbc-row rbc-row-resource" key={ `resource_${Index}` }>
              <div className="rbc-header">
                <ResourceHeaderComponent
                  index={ Index }
                  label={ accessors.resourceTitle(resource) }
                  resource={ resource }
                />
              </div>
            </div>
          ) }
          <div
            className={ `rbc-row rbc-time-header-cell${
              range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
            }` }
          >
            { <HeaderCells
              range={ range }
              getDrilldownView={ getDrilldownView }
              getNow={ getNow }
              getters={ getters }
              components={ components }
              onDrillDown={ onDrillDown }
            /> }
          </div>
          <DateContentRow
            isAllDay
            rtl={ rtl }
            getNow={ getNow }
            minRows={ 2 }
            // Add +1 to include showMore button row in the row limit
            maxRows={ allDayMaxRows + 1 }
            range={ range }
            events={ groupedEvents.get(id) || [] }
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
        </div>
      )) }
    </div>
  )

}


export default TimeGridHeader


interface HeaderCellsProps {
  range: Date[]
  getDrilldownView: (date: Date) => string
  getNow: () => Date
  getters: { dayProp: (date: Date) => { className: string, style: React.CSSProperties } }
  components: Components
  onDrillDown: (date: Date, view: string) => void
}

const HeaderCells = ({
  range,
  getDrilldownView,
  getNow,
  getters: { dayProp },
  components,
  onDrillDown,
}: HeaderCellsProps) => {
  const { localizer } = useCalendarContext()
  const { header: HeaderComponent = Header } = components

  const today = getNow()

  const handleHeaderClick = (date: Date, view: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    notify(onDrillDown, [date, view])
  }

  return (
    <>{ range.map((date, i) => {
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dayFormat')

      const { className, style } = dayProp(date)

      let header = (
        <HeaderComponent date={ date } label={ label } />
      )

      return (
        <div
          key={ i }
          style={ style }
          className={ clsx('rbc-header', className, {
            'rbc-today': localizer.isSameDate(date, today),
          }) }
        >
          { drilldownView
            ? (
              <button
                type="button"
                className="rbc-button-link"
                onClick={ (e) => handleHeaderClick(date, drilldownView, e) }
              >
                { header }
              </button>
            )
            : (
              <span>{ header }</span>
            ) }
        </div>
      )
    }) }</>
  )
}



// This was never used?

// interface RowProps {
//   resource: Resource
//   events: CalendarEvent[]
//   rtl: boolean
//   selectable: boolean | 'ignoreEvents'
//   getNow: () => Date
//   range: Date[]
//   getters: Getters
//   accessors: Accessors
//   components: Components
//   resizable: boolean
//   allDayMaxRows: number
//   onSelectEvent: (event: CalendarEvent) => void
//   onShowMore: (events: CalendarEvent[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
//   onDoubleClickEvent: (event: CalendarEvent) => void
//   onKeyPressEvent: (event: CalendarEvent) => void
//   onSelectSlot: (slot: Date[]) => void
//   longPressThreshold: number
// }

// const Row = ({
//   resource,
//   events,
//   rtl,
//   selectable,
//   getNow,
//   range,
//   getters,
//   accessors,
//   components,
//   resizable,
//   allDayMaxRows,
//   onSelectEvent,
//   onShowMore,
//   onDoubleClickEvent,
//   onKeyPressEvent,
//   onSelectSlot,
//   longPressThreshold,
// }: RowProps) => {
//   const resourceId = accessors.resourceId(resource)
//   let eventsToDisplay = resource
//     ? events.filter((event) => accessors.resource(event) === resourceId)
//     : events

//   return (
//     <DateContentRow
//       isAllDay
//       rtl={ rtl }
//       getNow={ getNow }
//       minRows={ 2 }
//       // Add +1 to include showMore button row in the row limit
//       maxRows={ allDayMaxRows + 1 }
//       range={ range }
//       events={ eventsToDisplay }
//       resourceId={ resourceId }
//       className="rbc-allday-cell"
//       selectable={ selectable }
//       selected={ selected }
//       components={ components }
//       accessors={ accessors }
//       getters={ getters }
//       onSelect={ onSelectEvent }
//       onShowMore={ onShowMore }
//       onDoubleClick={ onDoubleClickEvent }
//       onKeyPress={ onKeyPressEvent }
//       onSelectSlot={ onSelectSlot }
//       longPressThreshold={ longPressThreshold }
//       resizable={ resizable }
//     />
//   )
// }
