import { useEffect, useCallback, useMemo, forwardRef } from "react"
import { useTimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"
import TimeSlotGroup from "./TimeSlotGroup"
import clsx from "clsx"
import { useCalendarContext } from "@/components/Calendar"
import { Resource } from "@/utils/Resources"
import { Getters } from "@/utils/components"

interface TimeGutterProps<TResource extends Resource = Resource> {
  min: Date
  max: Date
  timeslots: number
  step: number
  resource: TResource
  getters: Getters
}

const TimeGutter = forwardRef<HTMLDivElement, TimeGutterProps>((
  {
    min,
    max,
    timeslots = 2,
    step = 30,
    resource,
    getters,
  },
  ref
) => {
  const { localizer, getNow, components: {
    timeGutterWrapper: TimeGutterWrapper,
  } } = useCalendarContext()

  const validMin = min || new Date()
  const validMax = max || localizer.add(validMin, 1, "day")
  const validTimeslots = Math.max(1, timeslots)
  const validStep = Math.max(1, step)

  const slotMetrics = useTimeSlotMetrics({
    min: validMin,
    max: validMax,
    timeslots: validTimeslots,
    step: validStep,
  })

  /**
   * Since the TimeGutter only displays the 'times' of slots in a day, and is separate
   * from the Day Columns themselves, we check to see if the range contains an offset difference
   * and, if so, change the beginning and end 'date' by a day to properly display the slots times
   * used.
   */
  const { start, end } = useMemo(() => {
    if(localizer.getTimezoneOffset(validMin) !== localizer.getTimezoneOffset(validMax)) {
      return {
        start: localizer.add(validMin, -1, "day"),
        end: localizer.add(validMax, -1, "day"),
      }
    }
    return { start: validMin, end: validMax }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validMin?.toISOString(), validMax?.toISOString(), localizer])

  useEffect(() => {
    if(slotMetrics) {
      slotMetrics.update({
        min: start,
        max: end,
        timeslots: validTimeslots,
        step: validStep,
        localizer,
      })
    }
    /**
     * We don't want this to fire when slotMetrics is updated as it would recursively bomb
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start?.toISOString(), end?.toISOString(), validTimeslots, validStep])

  const renderSlot = useCallback((value: Date, index: number) => {
    if(index === 0) return null

    const isNow = slotMetrics.dateIsInGroup(getNow(), index)

    return (
      <span className={ clsx("rbc-label", isNow && "rbc-now") }>
        { localizer.format(value, "timeGutterFormat") }
      </span>
    )
  }, [slotMetrics, localizer, getNow])

  return (
    <TimeGutterWrapper slotMetrics={ slotMetrics }>
      <div className={ clsx("rbc-time-gutter", "rbc-time-column") } ref={ ref }>
        { slotMetrics.groups.map((grp, Index) => {
          return (
            <TimeSlotGroup
              key={ Index }
              group={ grp }
              resource={ resource }
              renderSlot={ renderSlot }
            />
          )
        }) }
      </div>
    </TimeGutterWrapper>
  )
})

export default TimeGutter
