import clsx from "clsx"

import { useCalendarContext } from "@/Calendar"
import { DateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { CalendarEvent } from "@/utils/components"

import { eventsInSlot } from "./EventEndingRow"

interface ShowMoreProps {
  segments: CalendarEvent[]
  slotMetrics: DateSlotMetrics
  slot: number
  onShowMore: (slot: number, e: React.MouseEvent<HTMLElement>) => void
}

export const ShowMore = ({ segments, slotMetrics, slot, onShowMore }: ShowMoreProps) => {
  const { localizer, components: {
    showMore: ShowMoreComponent,
  } } = useCalendarContext()

  const events = slotMetrics.getEventsForSlot(slot)
  const remainingEvents = eventsInSlot(segments, slot)
  const count = remainingEvents.length

  const showMore = (slot, e) => {
    e.preventDefault()
    e.stopPropagation()
    onShowMore(slot, e.target)
  }

  if(ShowMoreComponent) {
    // The received slot seems to be 1-based, but the range we use to pull the date is 0-based
    const slotDate = slotMetrics.getDateForSlot(slot - 1)

    return count
      ? <ShowMoreComponent
        slotDate={ slotDate }
        slot={ slot }
        count={ count }
        events={ events }
        remainingEvents={ remainingEvents }
      />
      : false
  }

  return count
    ? <button
      type="button"
      key={ "sm_" + slot }
      className={ clsx("rbc-button-link", "rbc-show-more") }
      onClick={ (e) => showMore(slot, e) }
    >
      { localizer.messages.showMore(count, remainingEvents, events) }
    </button>
    : <></>
}
