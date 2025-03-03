import NoopWrapper from './NoopWrapper'
import clsx from 'clsx'
import { Components, Getters } from '@/types'
import { Resource } from './utils/Resources'

interface TimeSlotGroupProps {
  renderSlot: (value: any, index: number) => React.ReactNode
  resource: Resource
  group: any[]
  getters: Getters
  components: Components
}

const TimeSlotGroup = ({
  renderSlot,
  resource,
  group,
  getters,
  components: { timeslotWrapper: Wrapper = NoopWrapper } = {},
}: TimeSlotGroupProps) => {
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
