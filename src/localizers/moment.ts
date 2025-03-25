import { Unit, StartOfWeek } from "date-arithmetic"
import { Culture, DateLocalizer, DateLocalizerSpec, Formats } from "."

const weekRangeFormat: Formats["dayRangeHeaderFormat"] = ({ start, end }, culture, local) =>
  local.format(start, "MMMM DD", culture) +
  " – " +
  // updated to use this localizer 'eq()' method
  local.format(end, local.eq(start, end, "month") ? "DD" : "MMMM DD", culture)

const dateRangeFormat: Formats["agendaHeaderFormat"] = ({ start, end }, culture, local) =>
  local.format(start, "L", culture) + " – " + local.format(end, "L", culture)

const timeRangeFormat: Formats["selectRangeFormat"] = ({ start, end }, culture, local) =>
  local.format(start, "LT", culture) + " – " + local.format(end, "LT", culture)

const timeRangeStartFormat: Formats["eventTimeRangeStartFormat"] = ({ start }, culture, local) =>
  local.format(start, "LT", culture) + " – "

const timeRangeEndFormat: Formats["eventTimeRangeEndFormat"] = ({ end }, culture, local) =>
  " – " + local.format(end, "LT", culture)

export const formats: Formats = {
  dateFormat: "DD",
  dayFormat: "DD ddd",
  weekdayFormat: "ddd",

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: "LT",

  monthHeaderFormat: "MMMM YYYY",
  dayHeaderFormat: "dddd MMM DD",
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: "ddd MMM DD",
  agendaTimeFormat: "LT",
  agendaTimeRangeFormat: timeRangeFormat,
}

type PossibleUnits = Unit | "FullYear" | undefined

function fixUnit(unit: PossibleUnits): Unit {
  if(!unit) return undefined

  let datePart = unit.toLowerCase() as Lowercase<PossibleUnits>

  if(datePart === "fullyear") {
    datePart = "year"
  }

  return datePart
}

type MomentJs = typeof import("moment")

type LocalizerFactory<TLibrary> = (lib: TLibrary) => DateLocalizer

const momentLocalizer: LocalizerFactory<MomentJs> = (moment) => {
  const locale = (m: ReturnType<MomentJs>, c: Culture) => (c ? m.locale(c) : m)

  const spec: DateLocalizerSpec = {
    formats,

    firstOfWeek: (culture) => {
      const data = culture ? moment.localeData(culture) : moment.localeData()
      return (data ? data.firstDayOfWeek() : 0) as StartOfWeek
    },

    firstVisibleDay: (date) => moment(date).startOf("month").startOf("week").toDate(),

    lastVisibleDay: (date) => moment(date).endOf("month").endOf("week").toDate(),

    visibleDays: (date) => {
      let current = moment(date).startOf("month").startOf("week").toDate()
      const last = moment(date).endOf("month").endOf("week").toDate()
      const days = []
      while(current <= last) {
        days.push(current)
        current = moment(current).add(1, "day").toDate()
      }
      return days
    },

    format: (value, format, culture) => {
      return locale(moment(value), culture).format(format)
    },

    lt: (a, b, unit) => {
      const datePart = fixUnit(unit)
      const dtA = datePart ? moment(a).startOf(datePart as any) : moment(a)
      const dtB = datePart ? moment(b).startOf(datePart as any) : moment(b)
      return dtA.isBefore(dtB, datePart)
    },

    lte: (a, b, unit) => {
      const datePart = fixUnit(unit)
      const dtA = datePart ? moment(a).startOf(datePart as any) : moment(a)
      const dtB = datePart ? moment(b).startOf(datePart as any) : moment(b)
      return dtA.isSameOrBefore(dtB, datePart)
    },

    gt: (a, b, unit) => {
      const datePart = fixUnit(unit)
      const dtA = datePart ? moment(a).startOf(datePart as any) : moment(a)
      const dtB = datePart ? moment(b).startOf(datePart as any) : moment(b)
      return dtA.isAfter(dtB, datePart)
    },

    gte: (a, b, unit) => {
      const datePart = fixUnit(unit)
      const dtA = datePart ? moment(a).startOf(datePart as any) : moment(a)
      const dtB = datePart ? moment(b).startOf(datePart as any) : moment(b)
      return dtA.isSameOrAfter(dtB, datePart)
    },

    eq: (a, b, unit) => {
      const datePart = fixUnit(unit)
      const dtA = datePart ? moment(a).startOf(datePart as any) : moment(a)
      const dtB = datePart ? moment(b).startOf(datePart as any) : moment(b)
      return dtA.isSame(dtB, datePart)
    },

    neq: (a, b, unit) => {
      return !spec.eq(a, b, unit)
    },

    merge: (date, time) => {
      if(!date && !time) return null
      const tm = moment(time).format("HH:mm:ss")
      const dt = moment(date).startOf("day").format("MM/DD/YYYY")
      return moment(`${dt} ${tm}`, "MM/DD/YYYY HH:mm:ss").toDate()
    },

    inRange: (day, min, max, unit = "day") => {
      const datePart = fixUnit(unit)
      const mDay = moment(day)
      const mMin = moment(min)
      const mMax = moment(max)
      return mDay.isBetween(mMin, mMax, datePart, "[]")
    },

    startOf: (date = null, unit) => {
      const datePart = fixUnit(unit)
      if(datePart) {
        return moment(date).startOf(datePart as any).toDate()
      }
      return moment(date).toDate()
    },

    endOf: (date = null, unit) => {
      const datePart = fixUnit(unit)
      if(datePart) {
        return moment(date).endOf(datePart as any).toDate()
      }
      return moment(date).toDate()
    },

    range: (start, end, unit = "day") => {
      const datePart = fixUnit(unit)
      let current = moment(start).toDate()
      const days = []
      while(spec.lte(current, end, unit)) {
        days.push(current)
        current = spec.add(current, 1, datePart)
      }
      return days
    },

    add: (date, adder, unit) => {
      const datePart = fixUnit(unit)
      return moment(date).add(adder, datePart as any).toDate()
    },

    diff: (a, b, unit = "day") => {
      const datePart = fixUnit(unit)
      const dtA = moment(a)
      const dtB = moment(b)
      return dtB.diff(dtA, datePart)
    },

    ceil: (date, unit) => {
      const datePart = fixUnit(unit)
      const floor = spec.startOf(date, datePart)
      return spec.eq(floor, date, unit) ? floor : spec.add(floor, 1, datePart)
    },

    min: (dateA, dateB) => {
      const dtA = moment(dateA)
      const dtB = moment(dateB)
      const minDt = moment.min(dtA, dtB)
      return minDt.toDate()
    },

    max: (dateA, dateB) => {
      const dtA = moment(dateA)
      const dtB = moment(dateB)
      const maxDt = moment.max(dtA, dtB)
      return maxDt.toDate()
    },

    minutes: (date) => {
      const dt = moment(date)
      return dt.minutes()
    },

    getSlotDate: (dt, minutesFromMidnight, offset) => {
      return moment(dt)
        .startOf("day")
        .minute(minutesFromMidnight + offset)
        .toDate()
    },

    getTimezoneOffset: (date) => {
      return moment(date).toDate().getTimezoneOffset()
    },

    getDstOffset: (start, end) => {
      const st = moment(start).local()
      const ed = moment(end).local()
      if(!moment.tz) {
        return st.toDate().getTimezoneOffset() - ed.toDate().getTimezoneOffset()
      }
      const tzName = st?._z?.name ?? moment.tz.guess()
      const startOffset = moment.tz.zone(tzName).utcOffset(+st)
      const endOffset = moment.tz.zone(tzName).utcOffset(+ed)
      return startOffset - endOffset
    },

    // getTotalMinutes
    getTotalMin: (start, end) => {
      return spec.diff(start, end, "minutes")
    },

    getMinutesFromMidnight: (start) => {
      const dayStart = moment(start).startOf("day")
      const day = moment(start)
      return day.diff(dayStart, "minutes") + spec.getDstOffset(dayStart.toDate(), start)
    },

    continuesPrior: (start, first) => {
      const mStart = moment(start)
      const mFirst = moment(first)
      return mStart.isBefore(mFirst, "day")
    },

    continuesAfter: (start, end, last) => {
      const mEnd = moment(end)
      const mLast = moment(last)
      return mEnd.isSameOrAfter(mLast, "minutes")
    },

    sortEvents: ({
      evtA: { start: aStart, end: aEnd, allDay: aAllDay },
      evtB: { start: bStart, end: bEnd, allDay: bAllDay },
    }) => {
      const startSort = +spec.startOf(aStart, "day") - +spec.startOf(bStart, "day")
      const durA = spec.daySpan(aStart, aEnd)
      const durB = spec.daySpan(bStart, bEnd)

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
    }) => {
      const startOfDay = moment(start).startOf("day")
      const eEnd = moment(end)
      const rStart = moment(rangeStart)
      const rEnd = moment(rangeEnd)

      const startsBeforeEnd = startOfDay.isSameOrBefore(rEnd, "day")
      const sameMin = !startOfDay.isSame(eEnd, "minutes")
      const endsAfterStart = sameMin
        ? eEnd.isAfter(rStart, "minutes")
        : eEnd.isSameOrAfter(rStart, "minutes")

      return startsBeforeEnd && endsAfterStart
    },

    isSameDate: (date1, date2) => {
      const dt = moment(date1)
      const dt2 = moment(date2)
      return dt.isSame(dt2, "day")
    },

    daySpan: (start, end) => {
      const mStart = moment(start)
      const mEnd = moment(end)
      const dur = moment.duration(mEnd.diff(mStart))
      return dur.days()
    },

    browserTZOffset: () => {
      const dt = new Date()
      const neg = /-/.test(dt.toString()) ? "-" : ""
      const dtOffset = dt.getTimezoneOffset()
      const comparator = Number(`${neg}${Math.abs(dtOffset)}`)
      const mtOffset = moment().utcOffset()
      return mtOffset > comparator ? 1 : 0
    },
  }

  return new DateLocalizer(spec)
}

export { momentLocalizer }
