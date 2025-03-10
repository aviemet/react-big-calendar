import clsx from "clsx"
import scrollbarSize from "dom-helpers/scrollbarSize"
import { DateContentRow } from "@/components/DateContentRow"
import { Resources, type Resource } from "@/utils/Resources"
import { useCalendarContext } from "@/components/Calendar"
import { DateRange } from "@/localizers"
import { CalendarEvent } from "@/utils/components"
import { WeekdayHeader } from "../WeekdayHeader"

export interface TimeGridHeaderProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  range: Date[]
  events: TEvent[]
  resources: ReturnType<typeof Resources<TEvent, TResource>>
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

const TimeGridHeader = ({
  width,
  resources,
  range,
  events,
  selectable,
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
  const { accessors, rtl, getNow, components: {
    timeGutterHeader: TimeGutterHeader,
    resourceHeader: ResourceHeaderComponent,
  } } = useCalendarContext()

  let style = {}
  if(isOverflowing) {
    style[rtl ? "marginLeft" : "marginRight"] = `${scrollbarSize() - 1}px`
  }

  const groupedEvents = resources.groupEvents(events)

  return (
    <div
      style={ style }
      ref={ scrollRef }
      className={ clsx("rbc-time-header", { "rbc-overflowing": isOverflowing }) }
    >
      <div
        className="rbc-label rbc-time-header-gutter"
        style={ { width, minWidth: width, maxWidth: width } }
      >
        <TimeGutterHeader />
      </div>

      { resources.map(([id, resource], index) => {
        return (
          <div className="rbc-time-header-content" key={ id || index }>

            { resource && (
              <div className="rbc-row rbc-row-resource" key={ `resource_${index}` }>
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
              <WeekdayHeader
                range={ range }
                getDrilldownView={ getDrilldownView }
                getNow={ getNow }
                onDrillDown={ onDrillDown }
              />
            </div>
            <DateContentRow
              isAllDay
              minRows={ 2 }
              // Add +1 to include showMore button row in the row limit
              renderHeader={ false }
              maxRows={ allDayMaxRows + 1 }
              range={ range }
              events={ groupedEvents.get(id) || [] }
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
          </div>
        )
      }) }
    </div>
  )

}

export { TimeGridHeader }
