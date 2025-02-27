import { NavigateAction, View, views } from './utils/constants'
import Month from './Views/MonthView'
import Week from './Views/WeekView'
import WorkWeek from './Views/WorkWeekView'
import Day from './Views/DayView'
import Agenda from './Views/AgendaView'
import { type Culture, type DateFormat } from './localizers'
import { CalendarProps } from './components/Calendar'
import { type Accessors, type Components, type Getters, type SlotInfo } from './types'

export interface TitleOptions {
  formats: DateFormat[]
  culture?: Culture | undefined
  [propName: string]: any
}

export interface ViewStatic {
  navigate(date: Date, action: NavigateAction, props: any): Date
  title(date: Date, options: TitleOptions): string
}

export type ViewsProps =
    | View[]
    | {
      work_week?: boolean | (React.ReactNode & ViewStatic) | undefined
      day?: boolean | (React.ReactNode & ViewStatic) | undefined
      agenda?: boolean | (React.ReactNode & ViewStatic) | undefined
      month?: boolean | (React.ReactNode & ViewStatic) | undefined
      week?: boolean | (React.ReactNode & ViewStatic) | undefined
    }

export type Selectable = boolean | "ignoreEvents"

export interface BaseViewProps<TEvent extends object = Event, TResource extends object = object> {
  date?: string | Date | undefined
  eventOffset: number
  events?: TEvent[] | undefined
  backgroundEvents?: TEvent[] | undefined
  resources?: TResource[] | undefined
  step?: number | undefined
  timeslots?: number | undefined
  range?: Date[] | undefined
  min?: Date | undefined
  max?: Date | undefined
  getNow?: (() => Date) | undefined
  scrollToTime?: Date | undefined
  showMultiDayTimes?: boolean | undefined
  rtl?: boolean | undefined
  width?: number | undefined
  accessors?: Accessors<TEvent> | undefined
  components?: Components<TEvent, TResource> | undefined
  getters?: Getters<TEvent> | undefined
  selected?: object | undefined
  selectable?: Selectable | undefined
  longPressThreshold?: number | undefined
  onNavigate?: ((action: NavigateAction) => void) | undefined
  onSelectSlot?: ((slotInfo: SlotInfo) => void) | undefined
  onSelectEnd?: ((...args: any[]) => any) | undefined
  onSelectStart?: ((...args: any[]) => any) | undefined
  onSelectEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined
  onDoubleClickEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined
  onKeyPressEvent?: ((...args: any[]) => any) | undefined
  onDrillDown?: ((date: Date, view: View) => void) | undefined
  getDrilldownView?:
      | ((targetDate: Date, currentViewName: View, configuredViewNames: View[]) => void)
      | null
      | undefined
  dayLayoutAlgorithm?: any
  className?: string | undefined
}

export type ViewComponent<TProps extends BaseViewProps> = React.ComponentType<TProps> & {
  range: (date: Date, props?: Partial<CalendarProps>) => { start: Date, end: Date }
  navigate: (date: Date, action: NavigateAction, props?: Partial<CalendarProps>) => Date
  title: (date: Date, props?: Partial<CalendarProps>) => string
}

const VIEW_COMPONENTS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
} as const

export default VIEW_COMPONENTS
