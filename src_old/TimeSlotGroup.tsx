import clsx from 'clsx'

import React, { Component } from 'react'

import BackgroundWrapper from './BackgroundWrapper'

export default class TimeSlotGroup extends Component {
  render() {
    const {
      renderSlot,
      resource,
      group,
      getters,
      components: { timeslotWrapper: Wrapper = BackgroundWrapper } = {},
    } = this.props

    const groupProps = getters ? getters.slotGroupProp(group) : {}
    return (
      <div className="rbc-timeslot-group" { ...groupProps }>
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
}

TimeSlotGroup.propTypes = {
  renderSlot: PropTypes.func,
  group: PropTypes.array.isRequired,
  resource: PropTypes.any,
  components: PropTypes.object,
  getters: PropTypes.object,
}
