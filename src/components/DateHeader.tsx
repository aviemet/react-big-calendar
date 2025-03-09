import { ViewHeaderProps } from "."

const DateHeader = ({ label, drilldownView, onDrillDown }: ViewHeaderProps) => {
  if(!drilldownView) {
    return <span>{ label }</span>
  }

  return (
    <button type="button" className="rbc-button-link" onClick={ onDrillDown }>
      { label }
    </button>
  )
}

export { DateHeader }
