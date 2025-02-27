import { useCalendarContext } from './components/Calendar'
import NoopWrapper from './NoopWrapper'
import clsx from 'clsx'

interface TimeSlotGroupProps {
  renderSlot: (value: any, index: number) => React.ReactNode
  resource: any
  group: any[]
  getters: any
}

const TimeSlotGroup = ({
  renderSlot,
  resource,
  group,
  getters,
}: TimeSlotGroupProps) => {
  const { components: { timeSlotWrapper: Wrapper = NoopWrapper } } = useCalendarContext()

  const groupProps = getters ? getters.slotGroupProp(group) : {}

  return (
    <div className={ clsx("rbc-timeslot-group") } { ...groupProps }>
      { group.map((value, Index) => {
        const slotProps = getters ? getters.slotProp(value, resource) : {}

        return (
          <Wrapper key={ Index } value={ value } resource={ resource }>
            <div
              { ...slotProps }
              className={ clsx('rbc-time-slot', slotProps.className) }
            >
              { renderSlot && renderSlot(value, Index) }
            </div>
          </Wrapper>
        )
      }) }
    </div>
  )
}

export default TimeSlotGroup
