import overlap from './layout-algorithms/overlap'
import noOverlap from './layout-algorithms/no-overlap'
import { CalendarEvent } from '@/types'
import { SlotMetrics } from './TimeSlots'
import { Accessors } from './accessors'

const DefaultAlgorithms = {
  overlap: overlap,
  'no-overlap': noOverlap,
}

function isFunction(a: string | Function): a is Function {
  return typeof a === 'function'
}

export function getStyledEvents({
  events,
  minimumStartDifference,
  slotMetrics,
  accessors,
  dayLayoutAlgorithm, // one of DefaultAlgorithms keys
  // or custom function
}: {
  events: CalendarEvent[]
  minimumStartDifference: number
  slotMetrics: SlotMetrics
  accessors: Accessors
  dayLayoutAlgorithm: string | ((...args: unknown[]) => unknown[])
}) {
  let algorithm = dayLayoutAlgorithm

  if(dayLayoutAlgorithm in DefaultAlgorithms)
    algorithm = DefaultAlgorithms[dayLayoutAlgorithm]

  if(!isFunction(algorithm)) {
    // invalid algorithm
    return []
  }

  return algorithm.apply(this, arguments)
}
