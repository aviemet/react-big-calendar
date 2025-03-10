import { TimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"
import { Accessors } from "../accessors"
import { CalendarEvent } from "../components"

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

class LayoutAlgorithmEvent {
  start: number
  end: number
  startMs: number
  endMs: number
  top: number
  height: number
  data: any
  rows?: Array<{ leaves: CalendarEvent[] }>
  leaves?: CalendarEvent[]
  row?: {
    leaves: CalendarEvent[]
    xOffset: number
    _width: number
  }
  container?: {
    _width: number
  }

  constructor(data: CalendarEvent, { accessors, slotMetrics }: { accessors: Accessors, slotMetrics: TimeSlotMetrics }) {
    const { start, startDate, end, endDate, top, height } =
      slotMetrics.getRange(accessors.start(data), accessors.end(data))

    this.start = start
    this.end = end
    this.startMs = +startDate
    this.endMs = +endDate
    this.top = top
    this.height = height
    this.data = data
  }

  /**
   * The event's width without any overlap.
   */
  get _width() {
    // The container event's width is determined by the maximum number of
    // events in any of its rows.
    if(this.rows) {
      const columns =
        this.rows.reduce(
          (max, row) => Math.max(max, row.leaves.length + 1), // add itself
          0
        ) + 1 // add the container

      return 100 / columns
    }

    // The row event's width is the space left by the container, divided
    // among itself and its leaves.
    if(this.leaves) {
      const availableWidth = 100 - this.container!._width
      return availableWidth / (this.leaves.length + 1)
    }

    // The leaf event's width is determined by its row's width
    return this.row!._width
  }

  /**
   * The event's calculated width, possibly with extra width added for
   * overlapping effect.
   */
  get width() {
    const noOverlap = this._width
    const overlap = Math.min(100, this._width * 1.7)

    // Containers can always grow.
    if(this.rows) {
      return overlap
    }

    // Rows can grow if they have leaves.
    if(this.leaves) {
      return this.leaves.length > 0 ? overlap : noOverlap
    }

    // Leaves can grow unless they're the last item in a row.
    const { leaves } = this.row!
    const index = leaves.indexOf(this)
    return index === leaves.length - 1 ? noOverlap : overlap
  }

  get xOffset() {
    // Containers have no offset.
    if(this.rows) return 0

    // Rows always start where their container ends.
    if(this.leaves) return this.container!._width

    // Leaves are spread out evenly on the space left by its row.
    const { leaves, xOffset, _width } = this.row!
    const index = leaves.indexOf(this) + 1
    return xOffset + index * _width
  }
}

export { LayoutAlgorithmEvent }
