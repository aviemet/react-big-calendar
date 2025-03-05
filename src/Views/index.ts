import React from 'react'
import { NavigateAction } from '../utils/constants'
import MonthView from './MonthView'
import WeekView from './WeekView'
import WorkWeekView from './WorkWeekView'
import DayView from './DayView'
import AgendaView from './AgendaView'
import { DateLocalizer, DateRange } from '../localizers'
import { CalendarProps } from '../Calendar'
import { CalendarEvent, type SlotInfo } from '../types'
import { DayLayoutAlgorithm, DayLayoutFunction } from '@/utils/layout-algorithms/types'
import { Resource } from '@/utils/Resources'

export type CalendarPropsWithLocalizer = CalendarProps & { localizer: DateLocalizer }

export type ViewsProps =
    | ViewName[]
    | {
      work_week?: boolean | (React.ReactNode & ViewComponent) | undefined
      day?: boolean | (React.ReactNode & ViewComponent) | undefined
      agenda?: boolean | (React.ReactNode & ViewComponent) | undefined
      month?: boolean | (React.ReactNode & ViewComponent) | undefined
      week?: boolean | (React.ReactNode & ViewComponent) | undefined
    }

export type Selectable = boolean | "ignoreEvents"

export interface BaseViewProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  events?: TEvent[] | undefined
  backgroundEvents?: TEvent[] | undefined
  resources?: TResource[] | undefined
  step?: number | undefined
  timeslots?: number | undefined
  range?: Date[] | undefined
  min?: Date | undefined
  max?: Date | undefined
  scrollToTime?: Date | undefined
  showMultiDayTimes?: boolean | undefined
  width?: number | undefined
  selected?: object | undefined
  selectable?: Selectable | undefined
  longPressThreshold?: number | undefined
  onNavigate?: ((action: NavigateAction, newDate?: Date) => void) | undefined
  onSelectSlot?: ((slotInfo: SlotInfo) => void) | undefined
  onSelectEnd?: ((...args: any[]) => any) | undefined
  onSelectStart?: ((...args: any[]) => any) | undefined
  onSelectEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined
  onDoubleClickEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined
  onKeyPressEvent?: ((...args: any[]) => any) | undefined
  onDrillDown?: ((date: Date, view: ViewName) => void) | undefined
  getDrilldownView?:
      | ((targetDate: Date, currentViewName: ViewName, configuredViewNames: ViewName[]) => string)
      | null
      | undefined
  dayLayoutAlgorithm?: DayLayoutAlgorithm | DayLayoutFunction<TEvent>
  className?: string | undefined
  [key: string]: any
}

export type ViewComponent<TProps extends BaseViewProps = BaseViewProps> = React.ComponentType<TProps> & {
  range: (date: Date, props?: CalendarPropsWithLocalizer) => DateRange
  navigate: (date: Date, action: NavigateAction, props?: CalendarPropsWithLocalizer) => Date
  title: (date: Date, props?: CalendarPropsWithLocalizer) => string
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
export type ViewName = typeof views[ViewKey]

const VIEW_COMPONENTS: Record<ViewName, ViewComponent> = {
  [views.MONTH]: MonthView,
  [views.WEEK]: WeekView,
  [views.WORK_WEEK]: WorkWeekView,
  [views.DAY]: DayView,
  [views.AGENDA]: AgendaView,
}

export default VIEW_COMPONENTS



