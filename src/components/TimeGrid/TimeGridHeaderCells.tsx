import React from "react"
import clsx from "clsx"
import { useCalendarContext } from "@/Calendar"
import { DateRange } from "@/localizers"

interface TimeGridHeaderCellsProps {
  range: DateRange
  getDrilldownView: (date: Date) => string
  onDrillDown: (date: Date, view: string) => void
}

const TimeGridHeaderCells = ({
  range,
  getDrilldownView,
  onDrillDown,
}: TimeGridHeaderCellsProps) => {
  const { localizer, getters, getNow, components: {
    header: HeaderComponent,
  } } = useCalendarContext()

  const today = getNow()

  const handleHeaderClick = (date: Date, view: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onDrillDown?.(date, view)
  }

  const rangeArray = localizer.range(range.start, range.end)

  return (
    <>{ rangeArray.map((date, i) => {
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, "dayFormat")

      const { className, style } = getters.dayProp(date)

      let header = (
        <HeaderComponent date={ date } label={ label } />
      )

      return (
        <div
          key={ i }
          style={ style }
          className={ clsx("rbc-header", className, {
            "rbc-today": localizer.isSameDate(date, today),
          }) }
        >
          { drilldownView
            ? (
              <button
                type="button"
                className="rbc-button-link"
                onClick={ (e) => handleHeaderClick(date, drilldownView, e) }
              >
                { header }
              </button>
            )
            : (
              <span>{ header }</span>
            ) }
        </div>
      )
    }) }</>
  )
}

export default TimeGridHeaderCells
