import React from 'react'
import { NavigateAction } from '../utils/constants'
import MonthView from './MonthView'
import WeekView from './WeekView'
import WorkWeekView from './WorkWeekView'
import DayView from './DayView'
import AgendaView from './AgendaView'
import { type Culture, type DateFormat } from '../localizers'
import { CalendarProps } from '../components/Calendar'
import { CalendarEvent, type Components, type Getters, type SlotInfo } from '../types'
import { DayLayoutAlgorithm } from '@/utils/layout-algorithms/types'
import { Accessors } from '@/utils/accessors'
import { Resource } from '@/utils/Resources'

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

export interface BaseViewProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  date?: Date | undefined
  eventOffset?: number
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
  dayLayoutAlgorithm?: DayLayoutAlgorithm
  className?: string | undefined
}

export type ViewComponent<TProps extends BaseViewProps = BaseViewProps> = React.ComponentType<TProps> & {
  range: (date: Date, props?: Partial<CalendarProps>) => { start: Date, end: Date } | Date[]
  navigate: (date: Date, action: NavigateAction, props?: Partial<CalendarProps>) => Date
  title: (date: Date, props?: Partial<CalendarProps>) => string
}

export function createViewComponent<
  TEvent extends CalendarEvent = CalendarEvent,
  TProps extends BaseViewProps<TEvent> = BaseViewProps<TEvent>
>(
  component: React.ComponentType<TProps>,
  staticProps: {
    range: ViewComponent<TProps>['range']
    navigate: ViewComponent<TProps>['navigate']
    title: ViewComponent<TProps>['title']
  }
): ViewComponent<TProps> {
  const viewComponent = component as ViewComponent<TProps>
  viewComponent.range = staticProps.range
  viewComponent.navigate = staticProps.navigate
  viewComponent.title = staticProps.title
  return viewComponent
}

export const views = {
  MONTH: 'month',
  WEEK: 'week',
  WORK_WEEK: 'work_week',
  DAY: 'day',
  AGENDA: 'agenda',
} as const

export type ViewKey = keyof typeof views
export type View = typeof views[ViewKey]

const VIEW_COMPONENTS = {
  [views.MONTH]: MonthView,
  [views.WEEK]: WeekView,
  [views.WORK_WEEK]: WorkWeekView,
  [views.DAY]: DayView,
  [views.AGENDA]: AgendaView,
} as unknown as Record<View, ViewComponent>

export default VIEW_COMPONENTS



