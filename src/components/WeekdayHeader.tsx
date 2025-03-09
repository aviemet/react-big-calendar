import { useCalendarContext } from "./Calendar"
import { Header } from "./Header"
import { ViewHeaderProps } from "."
import clsx from "clsx"

const WeekdayHeader = ({ date, range, drilldownView, onDrillDown }: ViewHeaderProps) => {
  const { localizer, getNow, getters, components: {
    header: HeaderComponent = Header,
  } } = useCalendarContext()

  const today = getNow()

  return range.map((date, i) => {
    let label = localizer.format(date, "dayFormat")

    const { className, style } = getters.dayProp(date)

    const handleHeaderClick = (date: Date, view: string, e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      onDrillDown?.(date, view)
    }

    return (
      <div
        key={ label }
        style={ style }
        className={ clsx(
          "rbc-header",
          className,
          localizer.isSameDate(date, today) && "rbc-today"
        ) }
      >
        { drilldownView
          ? <button
            type="button"
            className="rbc-button-link"
            onClick={ (e) => handleHeaderClick(date, drilldownView, e) }
          >
            <HeaderComponent date={ date } label={ label } localizer={ localizer } />
          </button>
          : <span>
            <HeaderComponent date={ date } label={ label } localizer={ localizer } />
          </span> }
      </div>
    )
  })
}

export { WeekdayHeader }
