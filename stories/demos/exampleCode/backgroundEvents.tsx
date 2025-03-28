import React, { Fragment, useMemo } from "react"

import { Calendar, Views, DateLocalizer } from "@/index"

import * as dates from "../../../src/utils/dates"
import DemoLink from "../../DemoLink.component"
import backgroundEvents from "../../resources/backgroundEvents"
import events from "../../resources/events"

let allViews = Object.keys(Views).map((k) => Views[k])

export default function BackgroundEventsCalendar({ localizer }: { localizer: DateLocalizer }) {
  const { defaultDate, max } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 13),
      max: dates.add(dates.endOf(new Date(2015, 17, 1), "day"), -1, "hours"),
    }),
    []
  )

  return (
    <Fragment>
      <DemoLink fileName="backgroundEvents" />
      <div className="height600">
        <Calendar
          backgroundEvents={ backgroundEvents }
          dayLayoutAlgorithm="no-overlap"
          defaultDate={ defaultDate }
          defaultView={ Views.DAY }
          events={ events }
          localizer={ localizer }
          max={ max }
          showMultiDayTimes
          step={ 60 }
          views={ allViews }
        />
      </div>
    </Fragment>
  )
}
