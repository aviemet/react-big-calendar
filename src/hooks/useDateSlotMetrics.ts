import { eventSegments, endOfRange, eventLevels } from '../utils/eventLevels'
import { useMemo } from 'react'
import { CalendarEvent } from '@/types'
import { Accessors } from '../utils/accessors'
import { useCalendarContext } from '@/Calendar'
import { DateLocalizer } from '@/localizers'

let isSegmentInSlot = (seg: { left: number, right: number }, slot: number) => seg.left <= slot && seg.right >= slot

const isEqual = <T extends Iterable<any>>(a: T, b: T) =>
  a[0].range === b[0].range && a[0].events === b[0].events

type SlotMetricsOptions = {
  range: Date[]
  events: CalendarEvent[]
  maxRows: number
  minRows: number
  accessors: Accessors
}

export function useDateSlotMetrics(options: SlotMetricsOptions) {
  const { localizer } = useCalendarContext()

  return useMemo(() => getSlotMetrics({ ...options, localizer }), [localizer, options])
}

function getSlotMetrics(options: SlotMetricsOptions & { localizer: DateLocalizer }) {
  const { range, events, maxRows, minRows, accessors, localizer } = options
  let { first, last } = endOfRange({ dateRange: range, localizer })

  let segments = events.map((evt: CalendarEvent) =>
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

    clone(args: SlotMetricsOptions & { localizer: DateLocalizer }) {
      return getSlotMetrics({ ...options, ...args })
    },

    getDateForSlot(slotNumber: number) {
      return range[slotNumber]
    },

    getSlotForDate(date: Date) {
      return range.find((r) => localizer.isSameDate(r, date))
    },

    getEventsForSlot(slot: number) {
      return segments
        .filter((seg) => isSegmentInSlot(seg, slot))
        .map((seg) => seg.event)
    },

    continuesPrior(event: CalendarEvent) {
      return localizer.continuesPrior(accessors.start(event), first)
    },

    continuesAfter(event: CalendarEvent) {
      const start = accessors.start(event)
      const end = accessors.end(event)
      return localizer.continuesAfter(start, end, last)
    },
  }
}
