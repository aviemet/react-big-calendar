import { overlap } from "./layout-algorithms/overlap"
import { noOverlap } from "./layout-algorithms/no-overlap"
import { Accessors } from "./accessors"
import { CalendarEvent } from "./components"
import { TimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"

const DefaultAlgorithms = {
  overlap: overlap,
  "no-overlap": noOverlap,
}

function isFunction(a: string | Function): a is Function {
  return typeof a === "function"
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
  slotMetrics: TimeSlotMetrics
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
