import { NavigateAction } from "../utils/moveDate"
import { MonthView } from "./MonthView"
import { WeekView } from "./WeekView"
import { WorkWeekView } from "./WorkWeekView"
import { DayView } from "./DayView"
import { AgendaView } from "./AgendaView"
import { DateLocalizer, DateRange } from "../localizers"
import { Resource } from "@/utils/Resources"
import { CalendarEvent, Getters, SlotInfo } from "@/utils/components"
import { Accessors } from "@/utils/accessors"

export type ViewStaticMethodProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> = {
  date: Date
  today: Date
  localizer: DateLocalizer
  events: TEvent[] | undefined
  resources: TResource[] | undefined
  accessors: Accessors<TEvent>
  getters: Getters<TEvent>
}

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

export interface BaseViewCallbacks<TEvent extends CalendarEvent = CalendarEvent> {
  onNavigate?: ((action: NavigateAction, newDate?: Date) => void) | undefined
  onSelectSlot?: ((slotInfo: SlotInfo) => void) | undefined
  onSelectEnd?: ((...args: any[]) => any) | undefined
  onSelectStart?: ((...args: any[]) => any) | undefined
  onSelectEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined
  onDoubleClickEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined
  onKeyPressEvent?: ((...args: any[]) => any) | undefined
  onDrillDown?: ((date: Date, view: ViewName | string) => void) | undefined
  getDrilldownView?:
      | ((targetDate: Date, currentViewName: ViewName, configuredViewNames: ViewName[]) => ViewName | string)
      | null
      | undefined
  onShowMore?: (events: TEvent[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
}

export interface BaseViewProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>
  extends BaseViewCallbacks<TEvent> {
  events?: TEvent[] | undefined
  backgroundEvents?: TEvent[] | undefined
  resources?: TResource[] | undefined
  step?: number | undefined
  timeslots?: number | undefined
  range?: Date[] | undefined
  min?: Date | undefined
  max?: Date | undefined
  scrollToTime?: Date | undefined
  enableAutoScroll?: boolean
  showMultiDayTimes?: boolean | undefined
  width?: number | undefined
  selected?: object | undefined
  selectable?: Selectable | undefined
  longPressThreshold?: number | undefined
  className?: string | undefined
  // [key: string]: any
}

export type ViewComponent<TProps extends BaseViewProps = BaseViewProps, TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> = React.ComponentType<TProps> & {
  range: (date: Date, props?: ViewStaticMethodProps<TEvent, TResource>) => DateRange
  navigate: (date: Date, action: NavigateAction, props?: ViewStaticMethodProps<TEvent, TResource>) => Date
  title: (date: Date, props: {
    localizer: DateLocalizer
    length?: number
  } & Partial<ViewStaticMethodProps<TEvent, TResource>> ) => string
}

export function createViewComponent<
  TEvent extends CalendarEvent = CalendarEvent,
  TResource extends Resource = Resource,
  TProps extends BaseViewProps<TEvent> = BaseViewProps<TEvent>
>(
  component: React.ComponentType<TProps>,
  staticProps: {
    range: ViewComponent<TProps, TEvent, TResource>["range"]
    navigate: ViewComponent<TProps, TEvent, TResource>["navigate"]
    title: ViewComponent<TProps, TEvent, TResource>["title"]
  }
): ViewComponent<TProps, TEvent, TResource> {
  const viewComponent = component as ViewComponent<TProps, TEvent, TResource>
  viewComponent.range = staticProps.range
  viewComponent.navigate = staticProps.navigate
  viewComponent.title = staticProps.title
  return viewComponent
}

export const views = {
  MONTH: "month",
  WEEK: "week",
  WORK_WEEK: "work_week",
  DAY: "day",
  AGENDA: "agenda",
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

export { VIEW_COMPONENTS }


