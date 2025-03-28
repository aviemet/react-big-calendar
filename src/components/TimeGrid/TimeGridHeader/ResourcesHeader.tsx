import clsx from "clsx"

import { useCalendarContext } from "@/Calendar"
import { DateContentRow } from "@/components/DateContentRow"

import { TimeGridHeaderProps } from "../TimeGridHeader"

const ResourcesHeader = ({
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
  const { getters, accessors, getNow, localizer, components: {
    header: HeaderComponent,
    resourceHeader: ResourceHeaderComponent,
  } } = useCalendarContext()

  const today = getNow()

  const groupedEvents = resources.groupEvents(events)

  return <>{ range.map((date) => {
    let drilldownView = getDrilldownView(date)
    let label = localizer.format(date, "dayFormat")

    const { className, style } = getters.dayProp(date)

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
            <HeaderComponent date={ date } label={ label } drilldownView={ drilldownView } onDrillDown={ onDrillDown } />
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

        <div className={ clsx("rbc-row", "rbc-m-b-negative-3", "rbc-h-full") }>
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
            )
          }) }
        </div>
      </div>
    )
  }) }
  </>
}

export { ResourcesHeader }
