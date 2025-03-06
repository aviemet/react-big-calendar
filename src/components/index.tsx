import { useMemo, useState } from "react"
import { DateHeaderProps } from "@/DateHeader"
import createContext from "@/hooks/createContext"

export interface CalendarSlotsContextValue {
  dateHeader: React.ComponentType<DateHeaderProps>
  setDateHeader: (component: React.ComponentType<DateHeaderProps>) => void
}

const [useCalendarSlots, CalendarSlotsContextProvider] = createContext<CalendarSlotsContextValue>()
export { useCalendarSlots }

export const CalendarSlotsProvider = ({ children }: { children: React.ReactNode }) => {
  const [dateHeader, setDateHeader] = useState<React.ComponentType<DateHeaderProps>>(() => {
    // Default implementation
    return ({ date, className, label }: DateHeaderProps) => (
      <div role="cell" className={ className }>
        { label }
      </div>
    )
  })

  const value = useMemo(
    () => ({
      dateHeader,
      setDateHeader,
    }),
    [dateHeader]
  )

  return (
    <CalendarSlotsContextProvider value={ value }>
      { children }
    </CalendarSlotsContextProvider>
  )
}
