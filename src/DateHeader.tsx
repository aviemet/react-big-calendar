import React from "react"

export interface DateHeaderProps {
  drilldownView: string
  // isOffRange: boolean
  label: string
  onDrillDown: (e: React.MouseEvent<HTMLButtonElement>) => void
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
