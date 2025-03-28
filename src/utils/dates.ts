import * as dateArithmetic from "date-arithmetic"
import { Unit, StartOfWeek } from "date-arithmetic"

import { DateLocalizer } from "@/localizers"

export {
  milliseconds,
  seconds,
  minutes,
  hours,
  month,
  startOf,
  endOf,
  add,
  eq,
  neq,
  gte,
  gt,
  lte,
  lt,
  inRange,
  min,
  max,
} from "date-arithmetic"

const MILLI = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
}

const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export function monthsInYear(year: number) {
  let date = new Date(year, 0, 1)

  return MONTHS.map((i) => dateArithmetic.month(date, i))
}

export function firstVisibleDay(date: Date, localizer: DateLocalizer) {
  let firstOfMonth = dateArithmetic.startOf(date, "month")

  return dateArithmetic.startOf(firstOfMonth, "week", localizer.startOfWeek())
}

export function lastVisibleDay(date: Date, localizer: DateLocalizer) {
  let endOfMonth = dateArithmetic.endOf(date, "month")

  return dateArithmetic.endOf(endOfMonth, "week", localizer.startOfWeek())
}

export function visibleDays(date: Date, localizer: DateLocalizer) {
  let current = firstVisibleDay(date, localizer),
      last = lastVisibleDay(date, localizer),
      days = []

  while(dateArithmetic.lte(current, last, "day")) {
    days.push(current)
    current = dateArithmetic.add(current, 1, "day")
  }

  return days
}

export function ceil(date: Date, unit: Unit, startOfWeek?: StartOfWeek) {
  let floor

  if(unit === "week") {
    floor = dateArithmetic.startOf(date, unit, startOfWeek)
  } else {
    floor = dateArithmetic.startOf(date, unit)
  }

  return dateArithmetic.eq(floor, date) ? floor : dateArithmetic.add(floor, 1, unit)
}

export function range(start: Date, end: Date, unit: Unit = "day") {
  let current = start
  const days = []

  while(dateArithmetic.lte(current, end, unit)) {
    days.push(current)
    current = dateArithmetic.add(current, 1, unit)
  }

  return days
}

export function merge(date: Date, time: Date) {
  if(time === null && date === null) return null

  if(time === null) time = new Date()
  if(date === null) date = new Date()

  date = dateArithmetic.startOf(date, "day")
  date = dateArithmetic.hours(date, dateArithmetic.hours(time))
  date = dateArithmetic.minutes(date, dateArithmetic.minutes(time))
  date = dateArithmetic.seconds(date, dateArithmetic.seconds(time))
  return dateArithmetic.milliseconds(date, dateArithmetic.milliseconds(time))
}

export function eqTime(dateA: Date, dateB: Date) {
  return (
    dateArithmetic.hours(dateA) === dateArithmetic.hours(dateB) &&
    dateArithmetic.minutes(dateA) === dateArithmetic.minutes(dateB) &&
    dateArithmetic.seconds(dateA) === dateArithmetic.seconds(dateB)
  )
}

export function isJustDate(date: Date) {
  return (
    dateArithmetic.hours(date) === 0 &&
    dateArithmetic.minutes(date) === 0 &&
    dateArithmetic.seconds(date) === 0 &&
    dateArithmetic.milliseconds(date) === 0
  )
}

type DateArithmeticUnit = "milliseconds" | "seconds" | "minutes" | "hours" | "date" | "weekday" | "month" | "year" | "decade" | "century"

export function duration(start: Date, end: Date, unit: DateArithmeticUnit | "week" | "day", firstOfWeek?: StartOfWeek) {
  if(unit === "week" || unit === "weekday") {
    return Math.abs(
      dateArithmetic.weekday(start, undefined, firstOfWeek).getTime() -
      dateArithmetic.weekday(end, undefined, firstOfWeek).getTime()
    )
  }

  const actualUnit = unit === "day" ? "date" as const : unit as DateArithmeticUnit

  return Math.abs(
    dateArithmetic[actualUnit](start, undefined) -
    dateArithmetic[actualUnit](end, undefined)
  )
}

// type DurationUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'day' | 'week' | 'month' | 'year'
// export function duration(start: Date, end: Date, unit: 'week', firstOfWeek: StartOfWeek): number
// export function duration(start: Date, end: Date, unit: Exclude<DurationUnit, 'week'>): number
// export function duration(start: Date, end: Date, unit: DurationUnit, firstOfWeek?: StartOfWeek) {
// if(unit === 'week') {
//   return dateArithmetic.diff(
//     dateArithmetic.weekday(start, undefined, firstOfWeek),
//     dateArithmetic.weekday(end, undefined, firstOfWeek),
//     'seconds',
//   )
// }

//   const timeMethod = dateArithmetic[unit === 'day' ? 'date' : unit]

//   return Math.abs(
//     timeMethod(start, undefined).getTime() - timeMethod(end, undefined).getTime()
//   )
// }

export function diff(dateA: Date, dateB: Date, unit: keyof typeof MILLI | "milliseconds") {
  if(!unit || unit === "milliseconds") return Math.abs(+dateA - +dateB)

  // the .round() handles an edge case
  // with DST where the total won't be exact
  // since one day in the range may be shorter/longer by an hour
  return Math.round(
    Math.abs(
      dateArithmetic.startOf(dateA, unit).getTime() / MILLI[unit] -
        dateArithmetic.startOf(dateB, unit).getTime() / MILLI[unit]
    )
  )
}

export function total(date: Date, unit: Unit) {
  let ms = date.getTime(),
      div = 1

  switch(unit) {
    case "week":
      div *= 7
    case "day":
      div *= 24
    case "hours":
      div *= 60
    case "minutes":
      div *= 60
    case "seconds":
      div *= 1000
  }

  return ms / div
}

export function week(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  return Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 8.64e7 + 1) / 7)
}

export function today() {
  return dateArithmetic.startOf(new Date(), "day")
}

export function yesterday() {
  return dateArithmetic.add(dateArithmetic.startOf(new Date(), "day"), -1, "day")
}

export function tomorrow() {
  return dateArithmetic.add(dateArithmetic.startOf(new Date(), "day"), 1, "day")
}
