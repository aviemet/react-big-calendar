import React, { forwardRef } from "react"

import { TimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"

export interface DayColumnWrapperProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  date?: Date
  slotMetrics: TimeSlotMetrics
  resourceId: string | number
}

const DayColumnWrapper = forwardRef<HTMLDivElement, DayColumnWrapperProps>((
  { children, className, style },
  ref
) => {
  return (
    <div className={ className } style={ style } ref={ ref }>
      { children }
    </div>
  )
})

export { DayColumnWrapper }
