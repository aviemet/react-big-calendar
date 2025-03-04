import React, { useMemo } from 'react'

import dayjs from 'dayjs'
import {
  Calendar,
  Views,
  dayjsLocalizer,
} from '../../../src'
import DemoLink from '../../DemoLink.component'
import events from '../../resources/events'
import * as dates from '../../../src/utils/dates'

const dLocalizer = dayjsLocalizer(dayjs)

const ColoredDateCellWrapper = ({ children }) =>(
  React.cloneElement(React.Children.only(children), {
    style: {
      backgroundColor: 'lightblue',
    },
  })
)

/**
 * We are defaulting the localizer here because we are using this same
 * example on the main 'About' page in Storybook
 */
export default function Basic({
  localizer = dLocalizer,
  showDemoLink = true,
  ...props
}) {
  const { components, defaultDate, max, views } = useMemo(
    () => ({
      components: {
        timeslotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(2015, 3, 1),
      max: dates.add(dates.endOf(new Date(2015, 17, 1), 'day'), -1, 'hours'),
      views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  )

  return (
    <>
      { showDemoLink ? <DemoLink fileName="basic" /> : null }
      <div className="height600" { ...props }>
        <Calendar
          components={ components }
          date={ defaultDate }
          events={ events }
          localizer={ localizer }
          max={ max }
          showMultiDayTimes
          step={ 60 }
          views={ views }
        />
      </div>
    </>
  )
}
