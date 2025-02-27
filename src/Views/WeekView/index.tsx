import { navigate, NavigateAction, View } from '@/utils/constants'
import TimeGrid from '../TimeGridView'
import { BaseViewProps, ViewComponent } from '..'
import { DateLocalizer } from '@/localizers'
import { Accessors, Components, Getters, SlotInfo } from '@/types'
import { DayLayoutAlgorithm } from '@/utils/layout-algorithms/types'
import { useCalendarContext } from '@/components/Calendar'

interface WeekViewProps extends BaseViewProps {
  date: Date
  events: Event[]
  backgroundEvents: Event[]
  resources: Resource[]
  step?: number
  timeslots?: number
  range?: Date[]
  min?: Date
  max?: Date
  getNow: () => Date
  scrollToTime?: Date
  enableAutoScroll?: boolean
  showMultiDayTimes?: boolean
  rtl?: boolean
  resizable?: boolean
  width?: number
  accessors: Accessors
  components: Components
  getters: Getters
  allDayMaxRows?: number
  selected?: object
  selectable?: boolean | 'ignoreEvents'
  longPressThreshold?: number
  onNavigate?: (action: NavigateAction) => void
  onSelectSlot?: (slotInfo: SlotInfo) => void
  onSelectEnd?: (...args: any[]) => any
  onSelectStart?: (...args: any[]) => any
  onSelectEvent?: (event: Event, e: React.SyntheticEvent<HTMLElement>) => void
  onDoubleClickEvent?: (event: Event, e: React.SyntheticEvent<HTMLElement>) => void
  onKeyPressEvent?: (...args: any[]) => any
  onShowMore?: (...args: any[]) => any
  onDrillDown?: (date: Date, view: View) => void
  getDrilldownView?: (targetDate: Date, currentViewName: View, configuredViewNames: View[]) => void
  dayLayoutAlgorithm?: DayLayoutAlgorithm
  showAllEvents?: boolean
  doShowMoreDrillDown?: boolean
  popup?: boolean
  handleDragStart?: (e: React.DragEvent<HTMLElement>) => void
  popupOffset?: number | { x: number, y: number }
  className?: string
}

const weekViewRange = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  let firstOfWeek = localizer.startOfWeek()
  let start = localizer.startOf(date, 'week', firstOfWeek)
  let end = localizer.endOf(date, 'week', firstOfWeek)

  return localizer.range(start, end)
}

const WeekView: ViewComponent<WeekViewProps> = (props) => {
  const { localizer } = useCalendarContext()

  /**
   * This allows us to default min, max, and scrollToTime
   * using our localizer. This is necessary until such time
   * as TimeGrid is converted to a functional component.
   */
  const {
    date,
    min = localizer.startOf(new Date(), 'day'),
    max = localizer.endOf(new Date(), 'day'),
    scrollToTime = localizer.startOf(new Date(), 'day'),
    enableAutoScroll = true,
  } = props

  return (
    <TimeGrid
      { ...props }
      range={ weekViewRange(date, { localizer }) }
      eventOffset={ 15 }
      localizer={ localizer }
      min={ min }
      max={ max }
      scrollToTime={ scrollToTime }
      enableAutoScroll={ enableAutoScroll }
    />
  )

}

WeekView.navigate = (date, action, { localizer }) => {
  switch(action) {
    case navigate.PREVIOUS:
      return localizer.add(date, -1, 'week')

    case navigate.NEXT:
      return localizer.add(date, 1, 'week')

    default:
      return date
  }
}

WeekView.range = weekViewRange

WeekView.title = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  let [start, ...rest] = WeekView.range(date, { localizer })
  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat')
}

export default WeekView
