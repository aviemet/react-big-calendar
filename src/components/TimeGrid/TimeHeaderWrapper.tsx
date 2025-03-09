import clsx from "clsx"

interface TimeHeaderWrapperProps {
  children?: React.ReactNode
  range: Date[]
}

const TimeHeaderWrapper = ({ children, range }: TimeHeaderWrapperProps) => {
  return (
    <div
      className={ clsx("rbc-row", "rbc-time-header-cell", {
        " rbc-time-header-cell-single-day": range.length <= 1,
      }) }
    >
      { children }
    </div>
  )
}

export { TimeHeaderWrapper }
