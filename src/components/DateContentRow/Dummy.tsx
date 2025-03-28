import clsx from "clsx"
import React, { forwardRef } from "react"

import { useCalendarContext } from "@/Calendar"

import { ViewHeaderProps } from ".."

interface DummyProps {
  className?: string
  range: Date[]
  showAllEvents?: boolean
  headingRowRef: React.RefObject<HTMLDivElement>
  eventRowRef: React.RefObject<HTMLDivElement>
  onHeadingClick?: (date: Date, drilldownView: ViewHeaderProps, e: React.MouseEvent<HTMLElement>) => void
}

const Dummy = forwardRef<HTMLDivElement, DummyProps>((
  { className, range, showAllEvents, headingRowRef, eventRowRef, onHeadingClick },
  ref,
) => {
  const { date: calendarDate, getNow, localizer, components: {
    dateHeader: DateHeaderComponent,
  } } = useCalendarContext()

  return (
    <div className={ className } ref={ ref }>
      <div
        className={ clsx(
          "rbc-row-content",
          showAllEvents && "rbc-row-content-scrollable"
        ) }
      >
        <div className="rbc-row" ref={ headingRowRef }>
          { range.map((date, index) => {
            let isOffRange = localizer.neq(date, calendarDate, "month")
            let isCurrent = localizer.isSameDate(date, calendarDate)
            let drilldownView = "day"// getDrilldownView(date)
            let label = localizer.format(date, "dateFormat")

            return <>
              <div
                role="cell"
                key={ `header_${index}` }
                className={ clsx("rbc-date-cell", {
                  "rbc-off-range": isOffRange,
                  "rbc-current": isCurrent,
                  "rbc-now": localizer.isSameDate(date, getNow()),
                }) }
              >
                <DateHeaderComponent
                  label={ label || localizer.format(date, "dateFormat") }
                  date={ date }
                  drilldownView={ drilldownView }
                  isOffRange={ isOffRange }
                  onDrillDown={ onHeadingClick }
                />
              </div>
            </>
          }) }
        </div>
        <div className="rbc-row" ref={ eventRowRef }>
          <div className="rbc-row-segment">
            <div className="rbc-event">
              <div className="rbc-event-content">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export { Dummy }

