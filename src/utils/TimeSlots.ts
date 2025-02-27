import { DateLocalizer } from "@/localizers"

const getKey = ({ min, max, step, timeSlots, localizer }: { min: Date, max: Date, step: number, timeSlots: number, localizer: DateLocalizer }) =>
  `${+localizer.startOf(min, 'minutes')}` +
  `${+localizer.startOf(max, 'minutes')}` +
  `${step}-${timeSlots}`

export function getSlotMetrics({
  min,
  max,
  step,
  timeSlots,
  localizer,
}: {
  min: Date
  max: Date
  step: number
  timeSlots: number
  localizer: DateLocalizer
}) {
  const key = getKey({ min, max, step, timeSlots, localizer })

  // DST differences are handled inside the localizer
  const totalMin = 1 + localizer.getTotalMin(min, max)
  const minutesFromMidnight = localizer.getMinutesFromMidnight(min)
  const numGroups = Math.ceil((totalMin - 1) / (step * timeSlots))
  const numSlots = numGroups * timeSlots

  const groups = new Array(numGroups)
  const slots = new Array(numSlots)
  // Each slot date is created from "zero", instead of adding `step` to
  // the previous one, in order to avoid DST oddities
  for(let grp = 0; grp < numGroups; grp++) {
    groups[grp] = new Array(timeSlots)

    for(let slot = 0; slot < timeSlots; slot++) {
      const slotIndex = grp * timeSlots + slot
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

  function positionFromDate(date) {
    const diff =
      localizer.diff(min, date, 'minutes') +
      localizer.getDstOffset(min, date)
    return Math.min(diff, totalMin)
  }

  return {
    groups,
    update(args) {
      if(getKey(args) !== key) return getSlotMetrics(args)
      return this
    },

    dateIsInGroup(date, groupIndex) {
      const nextGroup = groups[groupIndex + 1]
      return localizer.inRange(
        date,
        groups[groupIndex][0],
        nextGroup ? nextGroup[0] : max,
        'minutes'
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
      if(localizer.eq(next, slot)) next = localizer.add(slot, step, 'minutes')
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
      if(localizer.lt(date, min, 'minutes')) return slots[0]
      if(localizer.gt(date, max, 'minutes')) return slots[slots.length - 1]

      const diffMins = localizer.diff(min, date, 'minutes')
      return slots[(diffMins - (diffMins % step)) / step + offset]
    },

    startsBeforeDay(date) {
      return localizer.lt(date, min, 'day')
    },

    startsAfterDay(date) {
      return localizer.gt(date, max, 'day')
    },

    startsBefore(date) {
      return localizer.lt(localizer.merge(min, date), min, 'minutes')
    },

    startsAfter(date) {
      return localizer.gt(localizer.merge(max, date), max, 'minutes')
    },

    getRange(rangeStart, rangeEnd, ignoreMin, ignoreMax) {
      if(!ignoreMin)
        rangeStart = localizer.min(end, localizer.max(start, rangeStart))
      if(!ignoreMax)
        rangeEnd = localizer.min(end, localizer.max(start, rangeEnd))

      const rangeStartMin = positionFromDate(rangeStart)
      const rangeEndMin = positionFromDate(rangeEnd)
      const top =
        rangeEndMin > step * numSlots && !localizer.eq(end, rangeEnd)
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
