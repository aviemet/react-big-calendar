import { useMemo } from "react"

import { useCalendarContext } from "@/Calendar"
import { DateLocalizer } from "@/localizers"

export type TimeSlotMetrics = {
  groups: Date[][]
  update: (args: { min: Date, max: Date, step: number, timeslots: number, localizer: DateLocalizer }) => TimeSlotMetrics
  dateIsInGroup: (date: Date, groupIndex: number) => boolean
  nextSlot: (slot: Date) => Date
  closestSlotToPosition: (percent: number) => Date
  closestSlotFromPoint: (point: { x: number, y: number }, boundaryRect: { top: number, bottom: number }) => Date
  closestSlotFromDate: (date: Date, offset?: number) => Date
  startsBeforeDay: (date: Date) => boolean
  startsAfterDay: (date: Date) => boolean
  startsBefore: (date: Date) => boolean
  startsAfter: (date: Date) => boolean
  getRange: (rangeStart: Date, rangeEnd: Date, options?: { ignoreMin?: boolean, ignoreMax?: boolean }) => { top: number, height: number, start: number, startDate: Date, end: number, endDate: Date }
  getCurrentTimePosition: (rangeStart: Date) => number
  // getEventsForSlot: (slot: number) => CalendarEvent[]
  // getDateForSlot: (slot: number) => Date
  // slots: number
}

const getKey = ({ min, max, step, timeslots, localizer }: { min: Date, max: Date, step: number, timeslots: number, localizer: DateLocalizer }) =>
  `${+localizer.startOf(min, "minutes")}` +
  `${+localizer.startOf(max, "minutes")}` +
  `${step}-${timeslots}`

interface UseTimeSlotMetricsProps {
  min: Date
  max: Date
  step: number
  timeslots: number
}

export function useTimeSlotMetrics(props: UseTimeSlotMetricsProps): TimeSlotMetrics {
  const { localizer } = useCalendarContext()

  return useMemo(() => getTimeSlotMetrics({ ...props, localizer }), [localizer, props])
}

export function getTimeSlotMetrics({
  min,
  max,
  step,
  timeslots,
  localizer,
}: {
  min: Date
  max: Date
  step: number
  timeslots: number
  localizer: DateLocalizer
}): TimeSlotMetrics {
  // Add validation
  if(!min || !max) {
    throw new Error("min and max dates are required")
  }

  if(step <= 0) {
    throw new Error("step must be a positive number")
  }

  if(timeslots <= 0) {
    throw new Error("timeslots must be a positive number")
  }

  if(localizer.lt(max, min)) {
    throw new Error("max date must be after min date")
  }

  const key = getKey({ min, max, step, timeslots, localizer })

  // Ensure totalMin is at least 1 to prevent array length issues
  const totalMin = Math.max(1, localizer.getTotalMin(min, max))
  const minutesFromMidnight = localizer.getMinutesFromMidnight(min)

  // Ensure we don't get negative or zero values for groups/slots
  const numGroups = Math.max(1, Math.ceil((totalMin - 1) / (step * timeslots)))
  const numSlots = numGroups * timeslots

  const groups = new Array(numGroups)
  const slots = new Array(numSlots)
  // Each slot date is created from "zero", instead of adding `step` to
  // the previous one, in order to avoid DST oddities
  for(let grp = 0; grp < numGroups; grp++) {
    groups[grp] = new Array(timeslots)

    for(let slot = 0; slot < timeslots; slot++) {
      const slotIndex = grp * timeslots + slot
      const minFromStart = slotIndex * step
      // A date with total minutes calculated from the start of the day
      slots[slotIndex] = groups[grp][slot] = localizer.getSlotDate(
        min,
        minutesFromMidnight,
        minFromStart
      )
    }
  }

  // Necessary to be able to select up until the last timeslot in a day
  const lastSlotMinFromStart = slots.length * step
  slots.push(
    localizer.getSlotDate(min, minutesFromMidnight, lastSlotMinFromStart)
  )

  function positionFromDate(date: Date) {
    const diff =
      localizer.diff(min, date, "minutes") +
      localizer.getDstOffset(min, date)
    return Math.min(diff, totalMin)
  }

  return {
    groups,
    update(args) {
      if(getKey(args) !== key) return getTimeSlotMetrics(args)
      return this
    },

    dateIsInGroup(date, groupIndex) {
      const nextGroup = groups[groupIndex + 1]
      return localizer.inRange(
        date,
        groups[groupIndex][0],
        nextGroup ? nextGroup[0] : max,
        "minutes"
      )
    },

    nextSlot(slot) {
      // We cannot guarantee that the slot object must be in slots,
      // because after each update, a new slots array will be created.
      let next =
        slots[
          Math.min(
            slots.findIndex((s) => s === slot || localizer.eq(s, slot)) + 1,
            slots.length - 1
          )
        ]
      // in the case of the last slot we won't a long enough range so manually get it
      if(localizer.eq(next, slot)) next = localizer.add(slot, step, "minutes")
      return next
    },
    closestSlotToPosition(percent) {
      const slot = Math.min(
        slots.length - 1,
        Math.max(0, Math.floor(percent * numSlots))
      )
      return slots[slot]
    },

    closestSlotFromPoint(point, boundaryRect) {
      let range = Math.abs(boundaryRect.top - boundaryRect.bottom)
      return this.closestSlotToPosition((point.y - boundaryRect.top) / range)
    },

    closestSlotFromDate(date, offset = 0) {
      if(localizer.lt(date, min, "minutes")) return slots[0]
      if(localizer.gt(date, max, "minutes")) return slots[slots.length - 1]

      const diffMins = localizer.diff(min, date, "minutes")
      return slots[(diffMins - (diffMins % step)) / step + offset]
    },

    startsBeforeDay(date) {
      return localizer.lt(date, min, "day")
    },

    startsAfterDay(date) {
      return localizer.gt(date, max, "day")
    },

    startsBefore(date) {
      return localizer.lt(localizer.merge(min, date), min, "minutes")
    },

    startsAfter(date) {
      return localizer.gt(localizer.merge(max, date), max, "minutes")
    },

    getRange(rangeStart, rangeEnd, options) {
      if(!options?.ignoreMin)
        rangeStart = localizer.min(max, localizer.max(min, rangeStart))
      if(!options?.ignoreMax)
        rangeEnd = localizer.min(max, localizer.max(min, rangeEnd))

      const rangeStartMin = positionFromDate(rangeStart)
      const rangeEndMin = positionFromDate(rangeEnd)
      const top =
        rangeEndMin > step * numSlots && !localizer.eq(max, rangeEnd)
          ? ((rangeStartMin - step) / (step * numSlots)) * 100
          : (rangeStartMin / (step * numSlots)) * 100

      return {
        top,
        height: (rangeEndMin / (step * numSlots)) * 100 - top,
        start: positionFromDate(rangeStart),
        startDate: rangeStart,
        end: positionFromDate(rangeEnd),
        endDate: rangeEnd,
      }
    },

    getCurrentTimePosition(rangeStart) {
      const rangeStartMin = positionFromDate(rangeStart)
      const top = (rangeStartMin / (step * numSlots)) * 100

      return top
    },
  }
}
