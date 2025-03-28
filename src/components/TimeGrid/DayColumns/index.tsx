import { useCallback } from "react"

import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"
import { GroupedResourceManager, Resource } from "@/utils/Resources"

import { DayColumn } from "./DayColumn"

export interface DayColumnsProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  range: Date[]
  resourceManager: GroupedResourceManager<TEvent, TResource>
  resourceGroupingLayout: boolean
  groupedEvents: Map<string | number, TEvent[]>
  groupedBackgroundEvents: Map<string | number, TEvent[]>
  min: Date
  max: Date
  step?: number
  timeslots: number
  showMultiDayTimes: boolean
  selected: object
  longPressThreshold: number
}

const DayColumns = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>(props: DayColumnsProps<TEvent, TResource>) => {
  const {
    range,
    resourceManager,
    resourceGroupingLayout,
    groupedEvents,
    groupedBackgroundEvents,
    min,
    max,
    step = 30,
    timeslots,
    showMultiDayTimes,
    selected,
    longPressThreshold,
  } = props

  const { localizer, accessors, getNow } = useCalendarContext()

  const commonProps = useCallback((date: Date, resource: TResource, id: string | number) => ({
    step,
    date,
    timeslots,
    showMultiDayTimes,
    selected,
    // eventOffset
    longPressThreshold,
    key: `${id}-${date}`,
    resourceId: resource && id,
    min: localizer.merge(date, min),
    max: localizer.merge(date, max),
    isNow: localizer.isSameDate(date, getNow()),
    events: (groupedEvents.get(id) || []).filter((event) =>
      localizer.inRange(
        date,
        accessors.start(event),
        accessors.end(event),
        "day"
      )),
    backgroundEvents: (groupedBackgroundEvents.get(id) || []).filter((event) => localizer.inRange(
      date,
      accessors.start(event),
      accessors.end(event),
      "day"
    )),
  }), [accessors, getNow, groupedBackgroundEvents, groupedEvents, localizer, longPressThreshold, max, min, selected, showMultiDayTimes, step, timeslots])

  if(resourceGroupingLayout) {
    return <>{ range.map((date) => {
      return (
        <div style={ { display: "flex", minHeight: "100%", flex: 1 } } key={ date.toISOString() }>
          { resourceManager.map(([id, resource]) => {
            return (
              <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
                <DayColumn
                  { ...commonProps(date, resource, id) }
                />
              </div>
            )
          }) }
        </div>
      )
    }) }</>
  }

  return <>{ resourceManager.map(([id, resource]) => {
    return range.map((date) => (
      <DayColumn
        { ...commonProps(date, resource, id) }
      />
    ))
  })
  }</>
}

export { DayColumns }
