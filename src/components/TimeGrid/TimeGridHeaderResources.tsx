import clsx from "clsx"
import scrollbarSize from "dom-helpers/scrollbarSize"
import { DateContentRow } from "@/components/DateContentRow"
import { Header } from "@/components/Header"
import { ResourceHeader } from "@/components/ResourceHeader"
import { Resource, ResourceManager } from "@/utils/Resources"
import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"
import { TimeGridHeaderProps } from "./TimeGridHeader"

interface TimeGridHeaderResourcesProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  range: Date[]
  events: TEvent[]
  resources: ReturnType<typeof ResourceManager<TEvent, TResource>>
  isOverflowing: boolean
  resizable: boolean
  width: number
  selected: TEvent
  selectable: boolean | "ignoreEvents"
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
  range,
  scrollRef,
  isOverflowing,
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
  resources,
  events,
  resizable,
}: TimeGridHeaderProps) => {
  const { getters, accessors, rtl, getNow, components: {
    timeGutterHeader: TimeGutterHeader,
  } } = useCalendarContext()

  let style = {}
  if(isOverflowing) {
    style[rtl ? "marginLeft" : "marginRight"] = `${scrollbarSize() - 1}px`
  }

  return (
    <div
      style={ style }
      ref={ scrollRef }
      className={ clsx("rbc-time-header", isOverflowing && "rbc-overflowing") }
    >
      <div
        className={ clsx("rbc-label", "rbc-time-header-gutter") }
        style={ { width, minWidth: width, maxWidth: width } }
      >
        { TimeGutterHeader && <TimeGutterHeader /> }
      </div>

      <HeaderCells
        range={ range }
        getDrilldownView={ getDrilldownView }
        resources={ resources }
        events={ events }
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


export { TimeGridHeaderResources }

interface HeaderCellsProps {
  range: Date[]
  getDrilldownView: (date: Date) => string
  resources: Resource[]
  events: CalendarEvent[]
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
  resources,
  events,
  selectable,
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
  const { getters, accessors, rtl, getNow, localizer, components: {
    header: HeaderComponent,
    resourceHeader: ResourceHeaderComponent,
  } } = useCalendarContext()

  const handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    onDrillDown?.(date, view)
  }

  const today = getNow()

  const groupedEvents = resources.groupEvents(events)

  return range.map((date) => {
    let drilldownView = getDrilldownView(date)
    let label = localizer.format(date, "dayFormat")

    const { className, style } = getters.dayProp(date)

    let header = (
      <HeaderComponent date={ date } label={ label } />
    )

    return (
      <div key={ date.toISOString() }
        className={ clsx("rbc-time-header-content", "rbc-resource-grouping") }
      >
        <div
          className={ clsx("rbc-row", "rbc-time-header-cell", {
            "rbc-time-header-cell-single-day": range.length <= 1,
          }) }
        >
          <div
            style={ style }
            className={ clsx("rbc-header", className, {
              "rbc-today": localizer.isSameDate(date, today),
            }) }
          >
            { drilldownView
              ? <button
                type="button"
                className="rbc-button-link"
                onClick={ (e) => handleHeaderClick(date, drilldownView, e) }
              >
                { header }
              </button>
              : <span>{ header }</span> }
          </div>
        </div>

        <div className="rbc-row">
          { resources.map(([id, resource], index) => (
            <div
              key={ `resource_${id}` }
              className={ clsx("rbc-header", className, {
                "rbc-today": localizer.isSameDate(date, today),
              }) }
            >
              <ResourceHeaderComponent
                index={ index }
                label={ accessors.resourceTitle(resource) }
                resource={ resource }
              />
            </div>
          )) }
        </div>

        <div className={ clsx("rbc-row", "rbc-m-b-negative-3 rbc-h-full") }>
          { resources.map(([id, resource]) => {
            // Filter the grouped events by the current date.
            const filteredEvents = (groupedEvents.get(id) || []).filter(event => (
              localizer.isSameDate(event.start, date) || localizer.isSameDate(event.end, date)
            ))

            return (
              <DateContentRow
                key={ `resource_${id}` }
                isAllDay
                minRows={ 2 }
                maxRows={ allDayMaxRows + 1 }
                range={ [date] } // This ensures that only the single day is rendered
                events={ filteredEvents } // Only show filtered events for this day.
                resourceId={ resource && id }
                className="rbc-allday-cell"
                selectable={ selectable }
                selected={ selected }
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
