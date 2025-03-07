import React, { forwardRef } from "react"

interface DayColumnWrapperProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
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

export default DayColumnWrapper
