interface EventRowSpanProps {
  children?: React.ReactNode
  slots: number
  len: number
}

export const EventRowSpan = ({
  children = <></>,
  slots,
  len,
}: EventRowSpanProps) => {
  let per = (Math.abs(len) / slots) * 100 + "%"

  return (
    <div
      className="rbc-row-segment"
      // IE10/11 need max-width. flex-basis doesn't respect box-sizing
      style={ { WebkitFlexBasis: per, flexBasis: per, maxWidth: per } }
    >
      { children }
    </div>
  )
}
