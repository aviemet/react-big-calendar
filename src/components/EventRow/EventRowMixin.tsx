import { CalendarEvent } from "@/utils/components"
import EventCell from "./EventCell"
import { isSelected } from "@/utils/eventSelectionHelpers"
import { DateSlotMetrics } from "@/hooks/useDateSlotMetrics"

interface EventProps<TEvent extends CalendarEvent = CalendarEvent> {
  event: TEvent
  selected: any
  isAllDay: any
  onSelect: any
  onDoubleClick: any
  onKeyPress: any
  slotMetrics: DateSlotMetrics<TEvent>
  resizable: any
}

export const Event = <TEvent extends CalendarEvent = CalendarEvent>({
  event,
  selected,
  isAllDay,
  onSelect,
  onDoubleClick,
  onKeyPress,
  slotMetrics,
  resizable,
}: EventProps<TEvent>) => {
  let continuesPrior = slotMetrics.continuesPrior(event)
  let continuesAfter = slotMetrics.continuesAfter(event)

  return (
    <EventCell
      event={ event }
      onSelect={ onSelect }
      onDoubleClick={ onDoubleClick }
      onKeyPress={ onKeyPress }
      continuesPrior={ continuesPrior }
      continuesAfter={ continuesAfter }
      slotStart={ slotMetrics.first }
      slotEnd={ slotMetrics.last }
      selected={ isSelected(event, selected) }
      resizable={ resizable }
    />
  )
}

interface EventRowSpanProps {
  slots: number
  len: number
  children: React.ReactNode
}

export const EventRowSpan = ({
  slots,
  len,
  children = <></>,
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
