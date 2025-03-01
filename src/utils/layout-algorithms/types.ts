import { CalendarEvent } from "@/types"

export type DayLayoutFunction<TEvent extends object = CalendarEvent> = (_: {
  events: TEvent[]
  minimumStartDifference: number
  slotMetrics: any
  accessors: any
}) => Array<{
  event: TEvent
  style: {
    top: number
    height: number
    left: number
    width: number
    xOffset: number
  }
}>

export type DayLayoutAlgorithm = "overlap" | "no-overlap"
