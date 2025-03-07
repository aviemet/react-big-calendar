import EventCell from "./EventCell"
import { isSelected } from "@/utils/eventSelectionHelpers"

export const Event = ({
  event,
  selected,
  isAllDay,
  onSelect,
  onDoubleClick,
  onKeyPress,
  slotMetrics,
  resizable,
}) => {
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

export const EventRowSpan = ({
  slots,
  len,
  children = <></>,
}) => {
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


// Replaced this with normal components

// export default {
//   renderEvent(props, event) {
//     let {
//       selected,
//       isAllDay,
//       onSelect,
//       onDoubleClick,
//       onKeyPress,
//       slotMetrics,
//       resizable,
//     } = props

//     let continuesPrior = slotMetrics.continuesPrior(event)
//     let continuesAfter = slotMetrics.continuesAfter(event)

//     return (
//       <EventCell
//         event={ event }
//         onSelect={ onSelect }
//         onDoubleClick={ onDoubleClick }
//         onKeyPress={ onKeyPress }
//         continuesPrior={ continuesPrior }
//         continuesAfter={ continuesAfter }
//         slotStart={ slotMetrics.first }
//         slotEnd={ slotMetrics.last }
//         selected={ isSelected(event, selected) }
//         resizable={ resizable }
//         style={ { border: '2px solid purple' } }
//       />
//     )
//   },

//   renderSpan(slots, len, key, content = <></>) {
//     let per = (Math.abs(len) / slots) * 100 + '%'

//     return (
//       <div
//         key={ key }
//         className="rbc-row-segment"
//         // IE10/11 need max-width. flex-basis doesn't respect box-sizing
//         style={ { WebkitFlexBasis: per, flexBasis: per, maxWidth: per, border: '1px solid orange' } }
//       >
//         { content }
//       </div>
//     )
//   },
// }
