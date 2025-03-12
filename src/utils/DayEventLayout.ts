import { overlap } from "./layout-algorithms/overlap"
import { noOverlap } from "./layout-algorithms/no-overlap"
import { Accessors } from "./accessors"
import { CalendarEvent } from "./components"
import { TimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"
import { DayLayoutFunction } from "./layout-algorithms/LayoutAlgorithmEvent"

const DefaultAlgorithms = {
  overlap: overlap,
  "no-overlap": noOverlap,
} as const

export type DefaultDayLayoutAlgorithm = keyof typeof DefaultAlgorithms

export type DayLayoutAlgorithmProp<TEvent extends CalendarEvent = CalendarEvent> = DefaultDayLayoutAlgorithm | DayLayoutFunction<TEvent>

function isFunction(a: string | Function): a is Function {
  return typeof a === "function"
}

export function getStyledEvents<TEvent extends CalendarEvent = CalendarEvent>({
  events, minimumStartDifference, slotMetrics, accessors, dayLayoutAlgorithm,
}: {
  events: TEvent[]
  minimumStartDifference: number
  slotMetrics: TimeSlotMetrics
  accessors: Accessors
  dayLayoutAlgorithm: DayLayoutAlgorithmProp
}): (TEvent & {
    style: React.CSSProperties & {
      xOffset?: number
    }
  }
  )[] {
  let algorithm
  if(typeof dayLayoutAlgorithm === "string"
    && dayLayoutAlgorithm in DefaultAlgorithms) {
    algorithm = DefaultAlgorithms[dayLayoutAlgorithm]
  } else {
    algorithm = dayLayoutAlgorithm
  }

  if(!isFunction(algorithm)) {
    // eslint-disable-next-line no-console
    console.error("The event layout algorithm provided is invalid and cannot be used")
    return []
  }

  return algorithm.apply(this, arguments)
}
