import React from "react"
import { ViewName } from "../Views"

export interface DateHeaderProps {
  date: Date
  className?: string
  drilldownView?: ViewName | string | null
  isOffRange?: boolean
  label?: string
  onDrillDown?: (e: React.MouseEvent<HTMLElement>) => void
}

const DateHeader = ({ label, drilldownView, onDrillDown }: DateHeaderProps) => {
  if(!drilldownView) {
    return <span>{ label }</span>
  }

  return (
    <button type="button" className="rbc-button-link" onClick={ onDrillDown }>
      { label }
    </button>
  )
}

export default DateHeader
