import { ViewName } from "@/Views"

export interface ViewHeaderProps {
  date: Date
  range?: Date[]
  className?: string
  isOffRange?: boolean
  label?: string
  drilldownView?: ViewName | string | null
  onDrillDown: (date: Date, view: string) => void
}
