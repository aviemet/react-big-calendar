import overlap from './layout-algorithms/overlap'
import noOverlap from './layout-algorithms/no-overlap'
import { Accessors } from '@/types'

const DefaultAlgorithms = {
  overlap: overlap,
  'no-overlap': noOverlap,
}

function isFunction(a: unknown): a is Function {
  return !!(a && a.constructor && a?.call && a?.apply)
}

export function getStyledEvents({
  events,
  minimumStartDifference,
  slotMetrics,
  accessors,
  dayLayoutAlgorithm, // one of DefaultAlgorithms keys
  // or custom function
}: {
  events: Event[]
  minimumStartDifference: number
  slotMetrics: any // TODO: need SlotMetrics type
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
