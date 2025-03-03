import EventCell from './EventCell'
import { isSelected } from '@/utils/eventSelectionHelpers'

export default {
  renderEvent(props, event) {
    let {
      selected,
      isAllDay: _,
      accessors,
      getters,
      onSelect,
      onDoubleClick,
      onKeyPress,
      slotMetrics,
      components,
      resizable,
    } = props

    let continuesPrior = slotMetrics.continuesPrior(event)
    let continuesAfter = slotMetrics.continuesAfter(event)

    return (
      <EventCell
        event={ event }
        getters={ getters }
        accessors={ accessors }
        components={ components }
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
  },

  renderSpan(slots, len, key, content = <></>) {
    let per = (Math.abs(len) / slots) * 100 + '%'

    return (
      <div
        key={ key }
        className="rbc-row-segment"
        // IE10/11 need max-width. flex-basis doesn't respect box-sizing
        style={ { WebkitFlexBasis: per, flexBasis: per, maxWidth: per } }
      >
        { content }
      </div>
    )
  },
}
