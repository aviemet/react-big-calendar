import React, { forwardRef } from 'react'
import clsx from 'clsx'

interface DummyProps {
  className?: string
  range: Date[]
  renderHeader?: (props: { date: Date, key: string, className: string }) => React.ReactNode
  showAllEvents?: boolean
  headingRowRef: React.RefObject<HTMLDivElement>
  eventRowRef: React.RefObject<HTMLDivElement>
  renderHeadingCell: (date: Date, index: number) => React.ReactNode
}

const Dummy = forwardRef<HTMLDivElement, DummyProps>((
  { className, range, renderHeader, showAllEvents, headingRowRef, eventRowRef, renderHeadingCell },
  ref,
) => {
  return (
    <div className={ className } ref={ ref }>
      <div
        className={ clsx(
          'rbc-row-content',
          showAllEvents && 'rbc-row-content-scrollable'
        ) }
      >
        { renderHeader && (
          <div className="rbc-row" ref={ headingRowRef }>
            { range.map(renderHeadingCell) }
          </div>
        ) }
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

export default Dummy

