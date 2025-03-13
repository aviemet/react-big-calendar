import clsx from "clsx"
import scrollbarSize from "dom-helpers/scrollbarSize"
import { CalendarEvent } from "@/utils/components"
import { Resource, ResourceManager } from "@/utils/Resources"
import { Header } from "@/components/Header"
import { useCalendarContext } from "@/Calendar"
import { ResourceHeader } from "@/components/ResourceHeader"
import { DateContentRow } from "@/components/DateContentRow"
import { coerceArray } from "@/utils/helpers"

export interface TimeGridHeaderProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
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

const TimeGridHeader = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>({
  width,
  resources,
  range,
  events,
  selectable,
  scrollRef,
  isOverflowing,
  resizable,
  selected,
  allDayMaxRows,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,
  onShowMore,
  getDrilldownView,
  longPressThreshold,
}: TimeGridHeaderProps<TEvent, TResource>) => {

  const { localizer, getNow, getters, accessors, rtl, components: {
    header: HeaderComponent = Header,
    timeGutterHeader: TimeGutterHeader,
    resourceHeader: ResourceHeaderComponent = ResourceHeader,
  } } = useCalendarContext()

  const style = isOverflowing
    ? { [rtl ? "marginLeft" : "marginRight"]: `${scrollbarSize() - 1}px` }
    : {}

  const groupedEvents = resources.groupEvents(events)

  return (
    <div
      style={ style }
      ref={ scrollRef }
      className={ clsx("rbc-time-header", { "rbc-overflowing": isOverflowing }) }
    >
      <div
        className={ clsx("rbc-label", "rbc-time-header-gutter") }
        style={ { width, minWidth: width, maxWidth: width } }
      >
        <TimeGutterHeader />
      </div>

      { resources.map(([id, resource], index) => (
        <div className="rbc-time-header-content" key={ id || index }>

          { resource && (
            <div className={ clsx("rbc-row", "rbc-row-resource") } key={ `resource_${id || index}` }>
              <div className="rbc-header">
                <ResourceHeaderComponent
                  index={ index }
                  label={ accessors.resourceTitle(resource) }
                  resource={ resource }
                />
              </div>
            </div>
          ) }

          <div
            className={ clsx("rbc-row", "rbc-time-header-cell", {
              " rbc-time-header-cell-single-day": range.length <= 1,
            }) }
          >
            { range.map((date, i) => {
              const drilldownView = getDrilldownView(date)
              const label = localizer.format(date, "dayFormat")
              const { className, style } = getters.dayProp(date)

              return (
                <div
                  key={ i }
                  style={ style }
                  className={ clsx("rbc-header", className, {
                    "rbc-today": localizer.isSameDate(date, getNow()),
                  }) }
                >
                  <HeaderComponent
                    date={ date }
                    label={ label }
                    onDrillDown={ onDrillDown }
                    drilldownView={ drilldownView }
                  />
                </div>
              )
            }) }
          </div>
          <DateContentRow
            renderHeader={ false }
            isAllDay
            minRows={ 2 }
            // Add +1 to include showMore button row in the row limit
            maxRows={ allDayMaxRows + 1 }
            range={ range }
            events={ coerceArray(groupedEvents.get(id)) || [] as TEvent[] }
            resourceId={ resource && id }
            className="rbc-allday-cell"
            selectable={ selectable }
            selected={ selected }
            onSelect={ onSelectEvent }
            onShowMore={ onShowMore }
            onDoubleClick={ onDoubleClickEvent }
            onKeyPress={ onKeyPressEvent }
            onSelectSlot={ onSelectSlot }
            longPressThreshold={ longPressThreshold }
            resizable={ resizable }
          />
        </div>
      )) }
    </div>
  )
}

export { TimeGridHeader }
