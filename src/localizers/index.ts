export { default as dayjsLocalizer } from './dayjs'
export { default as dateFnsLocalizer } from './date-fns'
export { default as momentLocalizer } from './moment'
export { default as globalizeLocalizer } from './globalize'
export { default as luxonLocalizer } from './luxon'

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
import { StartOfWeek, Unit } from 'date-arithmetic'
import { buildMessages, type Messages } from '@/utils/messages'
import { CalendarEvent } from '@/types'

export interface DateRange {
  start: Date
  end: Date
}

export type Culture = string
export type FormatInput = number | string | Date | DateRange
export type DateFormatFunction = (date: Date, culture?: Culture, localizer?: DateLocalizer) => string
export type DateRangeFormatFunction = (range: DateRange, culture?: Culture, localizer?: DateLocalizer) => string
export type DateFormat = string | DateFormatFunction

export interface Formats {
  /**
	 * Format for the day of the month heading in the Month view.
	 * e.g. "01", "02", "03", etc
	 */
  dateFormat?: DateFormat | undefined

  /**
	 * A day of the week format for Week and Day headings,
	 * e.g. "Wed 01/04"
	 */
  dayFormat?: DateFormat | undefined

  /**
	 * Week day name format for the Month week day headings,
	 * e.g: "Sun", "Mon", "Tue", etc
	 */
  weekdayFormat?: DateFormat | undefined

  /**
	 * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
	 */
  timeGutterFormat?: DateFormat | undefined

  /**
	 * Toolbar header format for the Month view, e.g "2015 April"
	 */
  monthHeaderFormat?: DateFormat | undefined

  /**
	 * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
	 */
  dayRangeHeaderFormat?: DateRangeFormatFunction | undefined

  /**
	 * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
	 */
  dayHeaderFormat?: DateFormat | undefined

  /**
	 * Toolbar header format for the Agenda view, e.g. "4/1/2015 — 5/1/2015"
	 */
  agendaHeaderFormat?: DateRangeFormatFunction | undefined

  /**
	 * A time range format for selecting time slots, e.g "8:00am — 2:00pm"
	 */
  selectRangeFormat?: DateRangeFormatFunction | undefined

  agendaDateFormat?: DateFormat | undefined
  agendaTimeFormat?: DateFormat | undefined
  agendaTimeRangeFormat?: DateRangeFormatFunction | undefined

  /**
	 * Time range displayed on events.
	 */
  eventTimeRangeFormat?: DateRangeFormatFunction | undefined

  /**
	 * An optional event time range for events that continue onto another day
	 */
  eventTimeRangeStartFormat?: DateRangeFormatFunction | undefined

  /**
	 * An optional event time range for events that continue from another day
	 */
  eventTimeRangeEndFormat?: DateRangeFormatFunction | undefined
}


export type RangeFunction = (range: DateRange, culture: Culture, local: DateLocalizer) => string

type Formatter = (value: FormatInput, format: string, culture?: Culture) => string

export type FormatFunction = (value: FormatInput, culture: Culture, localizer: DateLocalizer) => string

export interface EventComparison {
  evtA: { start: Date, end: Date, allDay: boolean }
  evtB: { start: Date, end: Date, allDay: boolean }
}

export interface EventRangeComparison {
  event: { start: Date, end: Date }
  range: { start: Date, end: Date }
}

export const localizerDefaultMethods = {
  format: (
    localizer: DateLocalizer,
    formatter: Formatter,
    value: FormatInput,
    format: string | FormatFunction,
    culture: Culture
  ) => {
    const result = typeof format === 'function'
      ? format(value, culture, localizer)
      : formatter.call(localizer, value, format, culture)

    invariant(
      result === null || typeof result === 'string',
      '`localizer format(..)` must be a function'
    )

    return result
  },

  /**
   * This date conversion was moved out of TimeSlots.js, to
   * allow for localizer override
   */
  getSlotDate: (date: Date, minutesFromMidnight: number, offset: number) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      minutesFromMidnight + offset,
      0,
      0
    )
  },

  getDstOffset: (start: Date, end: Date) => {
    return start.getTimezoneOffset() - end.getTimezoneOffset()
  },

  // if the start is on a DST-changing day but *after* the moment of DST
  // transition we need to add those extra minutes to our minutesFromMidnight
  getTotalMin: (start: Date, end: Date) => {
    return diff(start, end, 'minutes') + localizerDefaultMethods.getDstOffset(start, end)
  },

  getMinutesFromMidnight: (start: Date) => {
    const dayStart = startOf(start, 'day')
    return diff(dayStart, start, 'minutes') + localizerDefaultMethods.getDstOffset(dayStart, start)
  },

  // These two are used by DateSlotMetrics
  continuesPrior: (start: Date, first: Date) => {
    return lt(start, first, 'day')
  },

  continuesAfter: (start: Date, end: Date, last: Date) => {
    const singleDayDuration = eq(start, end, 'minutes')
    return singleDayDuration
      ? gte(end, last, 'minutes')
      : gt(end, last, 'minutes')
  },

  daySpan: (start: Date, end: Date) => {
    return duration(start, end, 'day')
  },

  sortEvents: ({
    evtA: { start: aStart, end: aEnd, allDay: aAllDay },
    evtB: { start: bStart, end: bEnd, allDay: bAllDay },
  }: EventComparison): number => {
    const startSort = +startOf(aStart, 'day') - +startOf(bStart, 'day')

    const durA = localizerDefaultMethods.daySpan(aStart, aEnd)
    const durB = localizerDefaultMethods.daySpan(bStart, bEnd)

    return (
      startSort || // sort by start Day first
      durB - durA || // events spanning multiple days go first
      +!!bAllDay - +!!aAllDay || // then allDay single day events
      +aStart - +bStart || // then sort by start time
      +aEnd - +bEnd // then sort by end time
    )
  },

  inEventRange: ({
    event: { start, end },
    range: { start: rangeStart, end: rangeEnd },
  }: EventRangeComparison): boolean => {
    const eStart = startOf(start, 'day')

    const startsBeforeEnd = lte(eStart, rangeEnd, 'day')
    // when the event is zero duration we need to handle a bit differently
    const sameMin = neq(eStart, end, 'minutes')
    const endsAfterStart = sameMin
      ? gt(end, rangeStart, 'minutes')
      : gte(end, rangeStart, 'minutes')
    return startsBeforeEnd && endsAfterStart
  },

  // other localizers treats 'day' and 'date' equality very differently, so we
  // change the 'localizer.eq(date1, date2, 'day') into this new method, where
  // they can be treated correctly by the localizer overrides
  isSameDate: (date1: Date, date2: Date) => {
    return eq(date1, date2, 'day')
  },

  startAndEndAreDateOnly: (start: Date, end: Date) => {
    return isJustDate(start) && isJustDate(end)
  },
}

export interface DateLocalizerSpec {
  firstOfWeek: (culture?: Culture) => StartOfWeek
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
  sortEvents?: (comparison: EventComparison) => number
  inEventRange?: (comparison: EventRangeComparison) => boolean
  isSameDate?: (dateA: Date, dateB: Date) => boolean
  startAndEndAreDateOnly?: (dateA: Date, dateB: Date) => boolean
  browserTZOffset?: () => number
}

export class DateLocalizer {
  formats: DateLocalizerSpec['formats']
  startOfWeek: DateLocalizerSpec['firstOfWeek']
  messages: Messages<CalendarEvent>
  merge: DateLocalizerSpec['merge']
  inRange: DateLocalizerSpec['inRange']
  lt: DateLocalizerSpec['lt']
  lte: DateLocalizerSpec['lte']
  gt: DateLocalizerSpec['gt']
  gte: DateLocalizerSpec['gte']
  eq: DateLocalizerSpec['eq']
  neq: DateLocalizerSpec['neq']
  startOf: DateLocalizerSpec['startOf']
  endOf: DateLocalizerSpec['endOf']
  add: DateLocalizerSpec['add']
  range: DateLocalizerSpec['range']
  diff: DateLocalizerSpec['diff']
  ceil: DateLocalizerSpec['ceil']
  min: DateLocalizerSpec['min']
  max: DateLocalizerSpec['max']
  minutes: DateLocalizerSpec['minutes']
  daySpan: DateLocalizerSpec['daySpan']
  firstVisibleDay: DateLocalizerSpec['firstVisibleDay']
  lastVisibleDay: DateLocalizerSpec['lastVisibleDay']
  visibleDays: DateLocalizerSpec['visibleDays']
  getSlotDate: DateLocalizerSpec['getSlotDate']
  getTimezoneOffset: DateLocalizerSpec['getTimezoneOffset']
  getDstOffset: DateLocalizerSpec['getDstOffset']
  getTotalMin: DateLocalizerSpec['getTotalMin']
  getMinutesFromMidnight: DateLocalizerSpec['getMinutesFromMidnight']
  continuesPrior: DateLocalizerSpec['continuesPrior']
  continuesAfter: DateLocalizerSpec['continuesAfter']
  sortEvents: DateLocalizerSpec['sortEvents']
  inEventRange: DateLocalizerSpec['inEventRange']
  isSameDate: DateLocalizerSpec['isSameDate']
  startAndEndAreDateOnly: DateLocalizerSpec['startAndEndAreDateOnly']
  segmentOffset: number
  format: DateLocalizerSpec['format']

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
    this.format = (...args) => localizerDefaultMethods.format(this, spec.format, ...args)
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
    this.daySpan = spec.daySpan || localizerDefaultMethods.daySpan
    this.firstVisibleDay = spec.firstVisibleDay || firstVisibleDay
    this.lastVisibleDay = spec.lastVisibleDay || lastVisibleDay
    this.visibleDays = spec.visibleDays || visibleDays
    this.getSlotDate = spec.getSlotDate || localizerDefaultMethods.getSlotDate
    this.getTimezoneOffset = spec.getTimezoneOffset || (value => value.getTimezoneOffset())
    this.getDstOffset = spec.getDstOffset || localizerDefaultMethods.getDstOffset
    this.getTotalMin = spec.getTotalMin || localizerDefaultMethods.getTotalMin
    this.getMinutesFromMidnight = spec.getMinutesFromMidnight || localizerDefaultMethods.getMinutesFromMidnight
    this.continuesPrior = spec.continuesPrior || localizerDefaultMethods.continuesPrior
    this.continuesAfter = spec.continuesAfter || localizerDefaultMethods.continuesAfter
    this.sortEvents = spec.sortEvents || localizerDefaultMethods.sortEvents
    this.inEventRange = spec.inEventRange || localizerDefaultMethods.inEventRange
    this.isSameDate = spec.isSameDate || localizerDefaultMethods.isSameDate
    this.startAndEndAreDateOnly = spec.startAndEndAreDateOnly || localizerDefaultMethods.startAndEndAreDateOnly
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
    format: (value: FormatInput, format: string | keyof Formats) => {

      return localizer.format(value, typeof formats[format as keyof Formats] === 'string'
        ? formats[format as keyof Formats] as string
        : format as string,
      culture)
    },
  }
}
