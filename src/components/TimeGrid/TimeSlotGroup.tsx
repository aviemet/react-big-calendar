import { useCalendarContext } from "@/Calendar"
import { Resource } from "@/utils/Resources"
import clsx from "clsx"

interface TimeSlotGroupProps<TResource extends Resource = Resource> {
  renderSlot: (value: any, index: number) => React.ReactNode
  resource: TResource
  group: any[]
}

const TimeSlotGroup = ({
  renderSlot,
  resource,
  group,
}: TimeSlotGroupProps) => {
  const { getters, components: {
    timeslotWrapper: Wrapper,
  } } = useCalendarContext()

  const groupProps = getters ? getters.slotGroupProp(group) : {}

  return (
    <div className={ clsx("rbc-timeslot-group") } { ...groupProps }>
      { group.map((value, Index) => {
        const slotProps = getters ? getters.slotProp(value, resource) : {}

        return (
          <Wrapper key={ Index } value={ value } resource={ resource }>
            <div
              { ...slotProps }
              className={ clsx("rbc-time-slot", slotProps.className) }
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
