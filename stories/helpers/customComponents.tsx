import React from 'react'
import { action } from '@storybook/addon-actions'

const customComponents = {
  dateCellWrapper: (dateCellWrapperProps) => {
    // Show 'click me' text in arbitrary places by using the range prop
    const hasAlert = dateCellWrapperProps.range
      ? dateCellWrapperProps.range.some((date) => {
        return date.getDate() % 12 === 0
      })
      : false

    const style = {
      display: 'flex',
      flex: 1,
      borderLeft: '1px solid #DDD',
      backgroundColor: hasAlert ? '#f5f5dc' : '#fff',
    }
    return (
      <div style={ style }>
        { hasAlert && (
          <a onClick={ action('custom dateCellWrapper component clicked') }>
            Click me
          </a>
        ) }
        { dateCellWrapperProps.children }
      </div>
    )
  },
  timeslotWrapper: (timeslotWrapperProps) => {
    // Show different styles at arbitrary time
    const hasCustomInfo = timeslotWrapperProps.value
      ? timeslotWrapperProps.value.getHours() === 4
      : false
    const style = {
      display: 'flex',
      flex: 1,
      backgroundColor: hasCustomInfo ? '#f5f5dc' : '#fff',
    }
    return (
      <div style={ style }>
        { hasCustomInfo && 'Custom Day Wrapper' }
        { timeslotWrapperProps.children }
      </div>
    )
  },
  eventWrapper: (eventWrapperProps) => {
    const style = {
      border: '4px solid',
      borderColor:
        eventWrapperProps.event.start.getHours() % 2 === 0 ? 'green' : 'red',
      padding: '5px',
    }
    return <div style={ style }>{ eventWrapperProps.children }</div>
  },
  timeslotWrapper: (timeslotWrapperProps) => {
    const style =
      timeslotWrapperProps.resource === null ||
      timeslotWrapperProps.value.getMinutes() !== 0
        ? {}
        : {
          border: '4px solid',
          backgroundColor:
              timeslotWrapperProps.value.getHours() >= 8 &&
              timeslotWrapperProps.value.getHours() <= 17
                ? 'green'
                : 'red',
          padding: '5px',
        }
    return <div style={ style }>{ timeslotWrapperProps.children }</div>
  },
}

export default customComponents
