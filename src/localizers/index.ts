export { default as dayjsLocalizer } from './dayjs'
export { default as dateFnsLocalizer } from './date-fns'
export { default as momentLocalizer } from './moment'
export { default as globalizeLocalizer } from './globalize'
export { default as luxonLocalizer } from './luxon'

export * from './types'

import invariant from 'invariant'
import {
  merge,
  inRange,
  lt,
  lte,
  gt,
  gte,
  eq,
  neq,
  startOf,
  endOf,
  add,
  range,
  diff,
  duration,
  ceil,
  min,
  max,
  firstVisibleDay,
  lastVisibleDay,
  visibleDays,
  minutes,
  isJustDate,
} from '../utils/dates'
import { Culture, DateRange, FormatInput, Formats } from './types'
import { StartOfWeek, Unit } from 'date-arithmetic'
import { buildMessages, type Messages } from '@/utils/messages'
import { CalendarEvent } from '@/types'

export type RangeFunction = (range: DateRange, culture: Culture, local: DateLocalizer) => string

function _format(localizer: DateLocalizer, formatter: (value: FormatInput, format: string, culture?: Culture) => string, value: FormatInput, format: string, culture: Culture) {
  let result =
    typeof format === 'function'
      ? format(value, culture, localizer)
      : formatter.call(localizer, value, format, culture)

  invariant(
    result === null || typeof result === 'string',
    '`localizer format(..)` must be a function'
  )

  return result
}

/**
 * This date conversion was moved out of TimeSlots.js, to
 * allow for localizer override
 * @param {Date} dt - The date to start from
 * @param {Number} minutesFromMidnight
 * @param {Number} offset
 * @returns {Date}
 */
function getSlotDate(dt: Date, minutesFromMidnight: number, offset: number) {
  return new Date(
    dt.getFullYear(),
    dt.getMonth(),
    dt.getDate(),
    0,
    minutesFromMidnight + offset,
    0,
    0
  )
}

function getDstOffset(start: Date, end: Date) {
  return start.getTimezoneOffset() - end.getTimezoneOffset()
}

// if the start is on a DST-changing day but *after* the moment of DST
// transition we need to add those extra minutes to our minutesFromMidnight
function getTotalMin(start: Date, end: Date) {
  return diff(start, end, 'minutes') + getDstOffset(start, end)
}

function getMinutesFromMidnight(start: Date) {
  const dayStart = startOf(start, 'day')
  return diff(dayStart, start, 'minutes') + getDstOffset(dayStart, start)
}

// These two are used by DateSlotMetrics
function continuesPrior(start: Date, first: Date) {
  return lt(start, first, 'day')
}

function continuesAfter(start: Date, end: Date, last: Date) {
  const singleDayDuration = eq(start, end, 'minutes')
  return singleDayDuration
    ? gte(end, last, 'minutes')
    : gt(end, last, 'minutes')
}

function daySpan(start: Date, end: Date) {
  return duration(start, end, 'day')
}

interface EventComparison {
  evtA: { start: Date, end: Date, allDay: boolean }
  evtB: { start: Date, end: Date, allDay: boolean }
}

interface EventRangeComparison {
  event: { start: Date, end: Date }
  range: { start: Date, end: Date }
}

function sortEvents(comparison: EventComparison): number {
  const { evtA: { start: aStart, end: aEnd, allDay: aAllDay },
    evtB: { start: bStart, end: bEnd, allDay: bAllDay } } = comparison

  let startSort = +startOf(aStart, 'day') - +startOf(bStart, 'day')

  let durA = daySpan(aStart, aEnd)
  let durB = daySpan(bStart, bEnd)

  return (
    startSort || // sort by start Day first
    durB - durA || // events spanning multiple days go first
    +!!bAllDay - +!!aAllDay || // then allDay single day events
    +aStart - +bStart || // then sort by start time
    +aEnd - +bEnd // then sort by end time
  )
}

function inEventRange(comparison: EventRangeComparison): boolean {
  const { event: { start, end },
    range: { start: rangeStart, end: rangeEnd } } = comparison

  let eStart = startOf(start, 'day')

  let startsBeforeEnd = lte(eStart, rangeEnd, 'day')
  // when the event is zero duration we need to handle a bit differently
  const sameMin = neq(eStart, end, 'minutes')
  let endsAfterStart = sameMin
    ? gt(end, rangeStart, 'minutes')
    : gte(end, rangeStart, 'minutes')
  return startsBeforeEnd && endsAfterStart
}

// other localizers treats 'day' and 'date' equality very differently, so we
// abstract the change the 'localizer.eq(date1, date2, 'day') into this
// new method, where they can be treated correctly by the localizer overrides
function isSameDate(date1: Date, date2: Date) {
  return eq(date1, date2, 'day')
}

function startAndEndAreDateOnly(start: Date, end: Date) {
  return isJustDate(start) && isJustDate(end)
}

export interface DateLocalizerSpec {
  firstOfWeek: (culture?: Culture) => number
  format: (value: FormatInput, format: string, culture?: Culture) => string
  formats: Formats
  merge?: (date: Date, time: Date) => Date | null
  inRange?: typeof inRange
  lt?: typeof lt
  lte?: typeof lte
  gt?: typeof gt
  gte?: typeof gte
  eq?: typeof eq
  neq?: typeof neq
  startOf?: typeof startOf
  endOf?: typeof endOf
  add?: typeof add
  range?: (start: Date, end: Date, unit?: Unit) => Date[]
  diff?: (dateA: Date, dateB: Date, unit?: Unit) => number
  ceil?: (date: Date, unit: Unit) => Date
  min?: typeof min
  max?: typeof max
  minutes?: typeof minutes
  firstVisibleDay?: (date: Date, localizer: any) => Date
  lastVisibleDay?: (date: Date, localizer: any) => Date
  visibleDays?: (date: Date, localizer: any) => Date[]
  daySpan?: (dateA: Date, dateB: Date) => number
  getSlotDate?: (date: Date, minutesFromMidnight: number, offset: number) => Date
  getTimezoneOffset?: (date: Date) => number
  getDstOffset?: (date: Date, dateB: Date) => number
  getTotalMin?: (dateA: Date, dateB: Date) => number
  getMinutesFromMidnight?: (date: Date) => number
  continuesPrior?: (dateA: Date, dateB: Date) => boolean
  continuesAfter?: (dateA: Date, dateB: Date, dateC: Date) => boolean
  sortEvents?: (eventA: CalendarEvent, eventB: CalendarEvent) => number
  inEventRange?: (event: CalendarEvent, range: DateRange) => boolean
  isSameDate?: (dateA: Date, dateB: Date) => boolean
  startAndEndAreDateOnly?: (dateA: Date, dateB: Date) => boolean
  browserTZOffset?: () => number
}

function adaptToEventComparison(eventA: CalendarEvent, eventB: CalendarEvent): EventComparison {
  return {
    evtA: {
      start: eventA.start,
      end: eventA.end,
      allDay: eventA.allDay || false,
    },
    evtB: {
      start: eventB.start,
      end: eventB.end,
      allDay: eventB.allDay || false,
    },
  }
}

function adaptToEventRangeComparison(event: CalendarEvent, range: DateRange): EventRangeComparison {
  return {
    event: {
      start: event.start,
      end: event.end,
    },
    range,
  }
}

function sortEventsAdapter(eventA: CalendarEvent, eventB: CalendarEvent): number {
  return sortEvents(adaptToEventComparison(eventA, eventB))
}

function inEventRangeAdapter(event: CalendarEvent, range: DateRange): boolean {
  return inEventRange(adaptToEventRangeComparison(event, range))
}

export class DateLocalizer {
  formats: Formats
  startOfWeek: (culture?: Culture) => StartOfWeek
  messages: Messages<CalendarEvent>
  merge: (date: Date, time: Date) => Date | null
  inRange: typeof inRange
  lt: typeof lt
  lte: typeof lte
  gt: typeof gt
  gte: typeof gte
  eq: typeof eq
  neq: typeof neq
  startOf: typeof startOf
  endOf: typeof endOf
  add: typeof add
  range: (start: Date, end: Date, unit?: Unit) => Date[]
  diff: (dateA: Date, dateB: Date, unit?: Unit) => number
  ceil: (date: Date, unit?: Unit) => Date
  min: typeof min
  max: typeof max
  minutes: typeof minutes
  daySpan: (dateA: Date, dateB: Date) => number
  firstVisibleDay: (date: Date, localizer: any) => Date
  lastVisibleDay: (date: Date, localizer: any) => Date
  visibleDays: (date: Date, localizer: any) => Date[]
  getSlotDate: (date: Date, minutesFromMidnight: number, offset: number) => Date
  getTimezoneOffset: (date: Date) => number
  getDstOffset: (date: Date, dateB: Date) => number
  getTotalMin: (dateA: Date, dateB: Date) => number
  getMinutesFromMidnight: (date: Date) => number
  continuesPrior: (dateA: Date, dateB: Date) => boolean
  continuesAfter: (dateA: Date, dateB: Date, dateC: Date) => boolean
  sortEvents: (eventA: CalendarEvent, eventB: CalendarEvent) => number
  inEventRange: (event: CalendarEvent, range: DateRange) => boolean
  isSameDate: (dateA: Date, dateB: Date) => boolean
  startAndEndAreDateOnly: (dateA: Date, dateB: Date) => boolean
  segmentOffset: number
  format: (value: FormatInput, format: string | keyof Formats, culture?: Culture) => string

  constructor(spec: DateLocalizerSpec) {
    invariant(
      typeof spec.format === 'function',
      'date localizer `format(..)` must be a function'
    )
    invariant(
      typeof spec.firstOfWeek === 'function',
      'date localizer `firstOfWeek(..)` must be a function'
    )

    this.formats = spec.formats
    this.format = (...args) => _format(this, spec.format, ...args)
    this.startOfWeek = spec.firstOfWeek as (culture?: Culture) => StartOfWeek
    this.merge = spec.merge || merge
    this.inRange = spec.inRange || inRange
    this.lt = spec.lt || lt
    this.lte = spec.lte || lte
    this.gt = spec.gt || gt
    this.gte = spec.gte || gte
    this.eq = spec.eq || eq
    this.neq = spec.neq || neq
    this.startOf = spec.startOf || startOf
    this.endOf = spec.endOf || endOf
    this.add = spec.add || add
    this.range = spec.range || range
    this.diff = spec.diff || diff
    this.ceil = spec.ceil || ceil
    this.min = spec.min || min
    this.max = spec.max || max
    this.minutes = spec.minutes || minutes
    this.daySpan = spec.daySpan || daySpan
    this.firstVisibleDay = spec.firstVisibleDay || firstVisibleDay
    this.lastVisibleDay = spec.lastVisibleDay || lastVisibleDay
    this.visibleDays = spec.visibleDays || visibleDays
    this.getSlotDate = spec.getSlotDate || getSlotDate
    this.getTimezoneOffset =
      spec.getTimezoneOffset || ((value) => value.getTimezoneOffset())
    this.getDstOffset = spec.getDstOffset || getDstOffset
    this.getTotalMin = spec.getTotalMin || getTotalMin
    this.getMinutesFromMidnight =
      spec.getMinutesFromMidnight || getMinutesFromMidnight
    this.continuesPrior = spec.continuesPrior || continuesPrior
    this.continuesAfter = spec.continuesAfter || continuesAfter
    this.sortEvents = spec.sortEvents || sortEventsAdapter
    this.inEventRange = spec.inEventRange || inEventRangeAdapter
    this.isSameDate = spec.isSameDate || isSameDate
    this.startAndEndAreDateOnly =
      spec.startAndEndAreDateOnly || startAndEndAreDateOnly
    this.segmentOffset = spec.browserTZOffset ? spec.browserTZOffset() : 0
  }
}

export function mergeWithDefaults(
  localizer: DateLocalizer,
  culture: Culture | undefined,
  formatOverrides: Formats | undefined,
  messages: Messages<CalendarEvent> | undefined
) {
  const formats = {
    ...localizer.formats,
    ...formatOverrides,
  }

  return {
    ...localizer,
    messages: buildMessages(messages),
    startOfWeek: () => localizer.startOfWeek(culture),
    format: (value: FormatInput, format: string | keyof Formats) =>
      localizer.format(value, typeof formats[format as keyof Formats] === 'string'
        ? formats[format as keyof Formats] as string
        : format as string,
      culture),
  }
}
