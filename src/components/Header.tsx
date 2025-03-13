import { ViewName } from "@/Views"

export interface ViewHeaderProps {
  date: Date
  range?: Date[]
  className?: string
  isOffRange?: boolean
  label?: string
  drilldownView?: ViewName | string | null
  onDrillDown?: (date: Date, view: string) => void
}

const Header = ({ date, label, onDrillDown, drilldownView }: ViewHeaderProps) => {
  const handleHeaderClick = (date: Date, view: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onDrillDown?.(date, view)
  }

  return drilldownView
    ? (
      <button
        type="button"
        className="rbc-button-link"
        onClick={ (e) => handleHeaderClick(date, drilldownView, e) }
      >
        <span role="columnheader" aria-sort="none">
          { label }
        </span>
      </button>
    )
    : (
      <span>
        <span role="columnheader" aria-sort="none">
          { label }
        </span>
      </span>
    )
}

export { Header }
