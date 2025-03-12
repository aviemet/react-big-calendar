import { eventSegments, endOfRange, eventLevels } from "../utils/eventLevels"
import { useMemo } from "react"
import { Accessors } from "@/utils/accessors"
import { useCalendarContext } from "@/Calendar"
import { DateLocalizer } from "@/localizers"
import { CalendarEvent } from "@/utils/components"

let isSegmentInSlot = (seg: { left: number, right: number }, slot: number) => {
  return seg.left <= slot && seg.right >= slot
}

// const isEqual = <T extends Iterable<any>>(a: T, b: T) =>
//   a[0].range === b[0].range && a[0].events === b[0].events

type DateSlotMetricsOptions<TEvent extends CalendarEvent = CalendarEvent> = {
  range: Date[]
  events: TEvent[]
  maxRows: number
  minRows: number
}

export type DateSlotMetrics<TEvent extends CalendarEvent = CalendarEvent> = {
  first: Date
  last: Date
  levels: any[][]
  extra: any[]
  range: Date[]
  slots: number
  clone: (args: DateSlotMetricsOptions & {
    localizer: DateLocalizer
  }) => DateSlotMetrics
  getDateForSlot: (slotNumber: number) => Date
  getSlotForDate: (date: Date) => Date
  getEventsForSlot: (slot: number) => void
  continuesPrior: (event: TEvent) => boolean
  continuesAfter(event: TEvent): boolean
}

export function useDateSlotMetrics<TEvent extends CalendarEvent = CalendarEvent>(options: DateSlotMetricsOptions<TEvent>) {
  const { localizer, accessors } = useCalendarContext()

  return useMemo(() => getSlotMetrics({ ...options, localizer, accessors }), [localizer, accessors, options])
}

function getSlotMetrics<TEvent extends CalendarEvent = CalendarEvent>(
  options: DateSlotMetricsOptions<TEvent> & { localizer: DateLocalizer, accessors: Accessors }
): DateSlotMetrics<TEvent> {
  const { range, events, maxRows, minRows, accessors, localizer } = options
  let { first, last } = endOfRange({ dateRange: range, localizer })

  let segments = events.map((evt) =>
    eventSegments(evt, range, accessors, localizer)
  )

  let { levels, extra } = eventLevels(segments, Math.max(maxRows - 1, 1))
  // Subtract 1 from minRows to not include showMore button row when
  // it would be rendered
  const minEventRows = extra.length > 0 ? minRows - 1 : minRows
  while(levels.length < minEventRows) levels.push([])

  return {
    first,
    last,

    levels,
    extra,
    range,
    slots: range.length,

    clone(args) {
      return getSlotMetrics({ ...options, ...args })
    },

    getDateForSlot(slotNumber) {
      return range[slotNumber]
    },

    getSlotForDate(date) {
      return range.find((r) => localizer.isSameDate(r, date))
    },

    getEventsForSlot(slot) {
      return segments
        .filter((seg) => isSegmentInSlot(seg, slot))
        .map((seg) => seg.event)
    },

    continuesPrior(event) {
      return localizer.continuesPrior(accessors.start(event), first)
    },

    continuesAfter(event) {
      const start = accessors.start(event)
      const end = accessors.end(event)
      return localizer.continuesAfter(start, end, last)
    },
  }
}
