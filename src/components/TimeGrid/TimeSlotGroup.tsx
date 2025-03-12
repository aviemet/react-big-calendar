import { useCalendarContext } from "@/Calendar"
import clsx from "clsx"

interface TimeSlotGroupProps {
  renderSlot?: (value: any, index: number) => React.ReactNode
  resource: string | number
  group: Date[]
}

const TimeSlotGroup = ({
  renderSlot,
  resource,
  group,
}: TimeSlotGroupProps) => {
  const { getters, components: {
    timeslotWrapper: TimeslotWrapper,
  } } = useCalendarContext()

  const groupProps = getters ? getters.slotGroupProp(group) : {}

  return (
    <div className={ clsx("rbc-timeslot-group") } { ...groupProps }>
      { group.map((value, index) => {

        const slotProps = getters ? getters.slotProp(value, resource) : {}

        return (
          <TimeslotWrapper key={ index } value={ value } resource={ resource }>
            <div
              { ...slotProps }
              className={ clsx("rbc-time-slot", slotProps.className) }
            >
              { renderSlot && renderSlot(value, index) }
            </div>
          </TimeslotWrapper>
        )
      }) }
    </div>
  )
}

export { TimeSlotGroup }
