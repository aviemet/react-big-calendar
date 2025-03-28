import clsx from "clsx"

import { useCalendarContext } from "@/Calendar"
import { DateContentRow } from "@/components/DateContentRow"

import { TimeGridHeaderProps } from "../TimeGridHeader"
import { WeekdayHeader } from "../WeekdayHeader"

const DatesHeader = ({
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
  const { accessors, getNow, components: {
    resourceHeader: ResourceHeaderComponent,
  } } = useCalendarContext()

  const groupedEvents = resources.groupEvents(events)

  return <>{ resources.map(([id, resource], index) => (
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
        <WeekdayHeader
          range={ range }
          getDrilldownView={ getDrilldownView }
          getNow={ getNow }
          onDrillDown={ onDrillDown }
        />
      </div>

      <DateContentRow
        isAllDaya
        minRows={ 2 }
        renderHeader={ false }
        // Add +1 to include showMore button row in the row limit
        maxRows={ allDayMaxRows + 1 }
        range={ range }
        events={ groupedEvents.get(id) || [] }
        resourceId={ resource && id }
        className={ clsx("rbc-allday-cell") }
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
  ))
  }</>
}

export { DatesHeader }
