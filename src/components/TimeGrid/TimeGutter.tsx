import { useState, useEffect, useCallback, useMemo, forwardRef } from 'react'
import { useTimeSlotMetrics } from '@/hooks/useTimeSlotMetrics'
import TimeSlotGroup from './TimeSlotGroup'
import clsx from 'clsx'
import { Components } from '@/types'
import { useCalendarContext } from '@/Calendar'

interface TimeGutterProps {
  min: Date
  max: Date
  timeslots: number
  step: number
  getNow: () => Date
  resource: any
  getters: any
  components: Components
}

const TimeGutter = forwardRef<HTMLDivElement, TimeGutterProps>((
  {
    min,
    max,
    timeslots,
    step,
    getNow,
    resource,
    getters,
    components,
  },
  ref
) => {
  const { timeGutterWrapper: TimeGutterWrapper } = components
  const { localizer } = useCalendarContext()
  const slotMetrics = useTimeSlotMetrics({ min, max, timeslots, step })

  /**
   * Since the TimeGutter only displays the 'times' of slots in a day, and is separate
   * from the Day Columns themselves, we check to see if the range contains an offset difference
   * and, if so, change the beginning and end 'date' by a day to properly display the slots times
   * used.
   */
  const { start, end } = useMemo(() => {
    if(localizer.getTimezoneOffset(min) !== localizer.getTimezoneOffset(max)) {
      return {
        start: localizer.add(min, -1, 'day'),
        end: localizer.add(max, -1, 'day'),
      }
    }
    return { start: min, end: max }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min?.toISOString(), max?.toISOString(), localizer])

  useEffect(() => {
    if(slotMetrics) {
      slotMetrics.update({
        min: start,
        max: end,
        timeslots,
        step,
        localizer,
      })
    }
    /**
     * We don't want this to fire when slotMetrics is updated as it would recursively bomb
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start?.toISOString(), end?.toISOString(), timeslots, step])

  const renderSlot = useCallback((value: Date, index: number) => {
    if(index === 0) return null

    const isNow = slotMetrics.dateIsInGroup(getNow(), index)

    return (
      <span className={ clsx('rbc-label', isNow && 'rbc-now') }>
        { localizer.format(value, 'timeGutterFormat') }
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
              getters={ getters }
            />
          )
        }) }
      </div>
    </TimeGutterWrapper>
  )
})

export default TimeGutter
