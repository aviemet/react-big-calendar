import { DateLocalizer } from "@/localizers"
import { findIndex } from "lodash-es"
import { Accessors } from "./accessors"
import { CalendarEvent } from "./components"

type EndOfRangeArgs = { dateRange: Date[], unit?: "day", localizer: DateLocalizer }
export function endOfRange({ dateRange, unit = "day", localizer }: EndOfRangeArgs) {
  return {
    first: dateRange[0],
    last: localizer.add(dateRange[dateRange.length - 1], 1, unit),
  }
}

// properly calculating segments requires working with dates in
// the timezone we're working with, so we use the localizer
export function eventSegments<TEvent extends CalendarEvent>(
  event: TEvent,
  range: Date[],
  accessors: Accessors,
  localizer: DateLocalizer
) {
  let { first, last } = endOfRange({ dateRange: range, localizer })

  let slots = localizer.diff(first, last, "day")
  let start = localizer.max(
    localizer.startOf(accessors.start(event), "day"),
    first
  )
  let end = localizer.min(localizer.ceil(accessors.end(event), "day"), last)

  let padding = findIndex(range, (x) => localizer.isSameDate(x, start))
  let span = localizer.diff(start, end, "day")

  span = Math.min(span, slots)
  // The segmentOffset is necessary when adjusting for timezones
  // ahead of the browser timezone
  span = Math.max(span - localizer.segmentOffset, 1)

  return {
    event,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  }
}

export function eventLevels(rowSegments, limit = Infinity) {
  let i
  let j
  let seg
  const levels = []
  const extra = []

  for(i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i]

    for(j = 0; j < levels.length; j++) if(!segmentsOverlap(seg, levels[j])) break

    if(j >= limit) {
      extra.push(seg)
    } else {
      ;(levels[j] || (levels[j] = [])).push(seg)
    }
  }

  for(i = 0; i < levels.length; i++) {
    levels[i].sort((a, b) => a.left - b.left)
  }

  return { levels, extra }
}

export function inRange<TEvent extends CalendarEvent>(e: TEvent, start: Date, end: Date, accessors: Accessors, localizer: DateLocalizer) {
  const event = {
    start: accessors.start(e),
    end: accessors.end(e),
  }
  const range = { start, end }

  return localizer.inEventRange({ event, range })
}

export function segmentsOverlap(seg, otherSegs) {
  return otherSegs.some(
    (otherSeg) => otherSeg.left <= seg.right && otherSeg.right >= seg.left
  )
}

export function sortWeekEvents<TEvent extends CalendarEvent>(events: TEvent[], accessors: Accessors, localizer: DateLocalizer) {
  const base = [...events]
  const multiDayEvents: TEvent[] = []
  const standardEvents: TEvent[] = []

  base.forEach((event) => {
    const startCheck = accessors.start(event)
    const endCheck = accessors.end(event)

    if(localizer.daySpan(startCheck, endCheck) > 1) {
      multiDayEvents.push(event)
    } else {
      standardEvents.push(event)
    }
  })

  const multiSorted = multiDayEvents.sort((a, b) =>
    sortEvents(a, b, accessors, localizer)
  )

  const standardSorted = standardEvents.sort((a, b) =>
    sortEvents(a, b, accessors, localizer)
  )

  return [...multiSorted, ...standardSorted]
}

export function sortEvents<TEvent extends CalendarEvent>(eventA: TEvent, eventB: TEvent, accessors: Accessors, localizer: DateLocalizer): -1 | 0 | 1 {
  const evtA = {
    start: accessors.start(eventA),
    end: accessors.end(eventA),
    allDay: accessors.allDay(eventA),
  }
  const evtB = {
    start: accessors.start(eventB),
    end: accessors.end(eventB),
    allDay: accessors.allDay(eventB),
  }

  return localizer.sortEvents({ evtA, evtB })
}
