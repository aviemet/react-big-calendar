import clsx from "clsx"

import { useCalendarContext } from "../../Calendar"
import { Header, ViewHeaderProps } from "../Header"

const WeekdayHeader = ({ range, drilldownView, onDrillDown }: ViewHeaderProps) => {
  const { localizer, getNow, getters, components: {
    header: HeaderComponent = Header,
  } } = useCalendarContext()

  return range.map((date, i) => {
    let label = localizer.format(date, "dayFormat")

    const { className, style } = getters.dayProp(date)

    return (
      <div
        key={ label }
        style={ style }
        className={ clsx("rbc-header", className, {
          "rbc-today": localizer.isSameDate(date, getNow()),
        }) }
      >
        <HeaderComponent
          date={ date }
          label={ label }
          onDrillDown={ onDrillDown }
          drilldownView={ drilldownView }
        />
      </div>
    )
  })
}

export { WeekdayHeader }
