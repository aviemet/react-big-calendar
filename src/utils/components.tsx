import { DateLocalizer } from "@/localizers"
import { defaults, omit } from "lodash-es"
import { Accessors } from "./accessors"
import { HeaderProps } from "@/components/Header"
import DateHeader, { DateHeaderProps } from "@/components/DateHeader"
import ResourceHeader, { ResourceHeaderProps } from "@/components/ResourceHeader"
import { ViewName } from "@/Views"
import NoopWrapper from "@/components/NoopWrapper"
import Header from "@/components/Header"
import DayColumnWrapper from "@/components/DayColumnWrapper"
import { Resource } from "./Resources"

export interface CalendarEvent {
  allDay?: boolean | undefined
  title?: React.ReactNode | undefined
  start?: Date | undefined
  end?: Date | undefined
  resource?: any
}

export interface EventProps<TEvent extends object = CalendarEvent> {
  event: TEvent
  title: string
  continuesPrior: boolean
  continuesAfter: boolean
  isAllDay?: boolean
  localizer: DateLocalizer
  slotStart: Date
  slotEnd: Date
}

export interface SlotInfo {
  start: Date
  end: Date
  slots: Date[]
  action: "select" | "click" | "doubleClick"
  /** For "TimeGrid" views */
  resourceId?: number | string | undefined
  /** For "select" action */
  bounds?:
			| {
			  x: number
			  y: number
			  top: number
			  bottom: number
			  left: number
			  right: number
			}
			| undefined
  /** For "click" or "doubleClick" actions */
  box?:
			| {
			  x: number
			  y: number
			  clientX: number
			  clientY: number
			}
			| undefined
}

export type DayPropGetter = (date: Date, resourceId?: number | string) => React.HTMLAttributes<HTMLDivElement>
export type EventPropGetter<T> = (
  event: T,
  start: Date,
  end: Date,
  isSelected: boolean,
) => { className?: string | undefined, style?: React.CSSProperties }
export type SlotPropGetter = (date: Date, resourceId?: number | string) => React.HTMLAttributes<HTMLDivElement>
export type SlotGroupPropGetter = () => React.HTMLAttributes<HTMLDivElement>

export interface DateCellWrapperProps {
  range: Date[]
  value: Date
  children: React.JSX.Element
}

export interface ShowMoreProps<TEvent extends object = CalendarEvent> {
  localizer: DateLocalizer
  slot: number
  slotDate: Date
  count: number
  events: TEvent[]
  remainingEvents: TEvent[]
}

export type Getters<TEvent extends object = CalendarEvent> = {
  eventProp?: EventPropGetter<TEvent> | undefined
  slotProp?: SlotPropGetter | undefined
  dayProp?: DayPropGetter | undefined
  slotGroupProp?: SlotGroupPropGetter | undefined
}

export interface EventWrapperProps<TEvent extends CalendarEvent = CalendarEvent> {
  // https://github.com/intljusticemission/react-big-calendar/blob/27a2656b40ac8729634d24376dff8ea781a66d50/src/TimeGridEvent.js#L28
  style?: (React.CSSProperties & { xOffset: number }) | undefined
  className: string
  event: TEvent
  isRtl: boolean
  getters: Getters<TEvent>
  onClick: (e: React.MouseEvent<HTMLElement>) => void
  onDoubleClick: (e: React.MouseEvent<HTMLElement>) => void
  accessors: Accessors<TEvent>
  selected: boolean
  label: string
  continuesEarlier: boolean
  continuesLater: boolean
}

interface CommonComponents<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  event?: React.ComponentType<EventProps<TEvent>> | undefined
  backgroundEventWrapper?: React.ComponentType<EventWrapperProps<TEvent>> | undefined
  eventWrapper?: React.ComponentType<EventWrapperProps<TEvent>> | undefined
  eventContainerWrapper?: React.ComponentType | undefined
  dateCellWrapper?: React.ComponentType<DateCellWrapperProps> | undefined
  dayColumnWrapper?: React.ComponentType | undefined
  weekWrapper?: React.ComponentType | undefined
  timeslotWrapper?: React.ComponentType | undefined
  timeGutterHeader?: React.ComponentType | undefined
  timeGutterWrapper?: React.ComponentType | undefined
  toolbar?: React.ComponentType | undefined

  // components used as a header for each column in the TimeGridHeader
  header?: React.ComponentType<HeaderProps> | undefined
  resourceHeader?: React.ComponentType<ResourceHeaderProps<TResource>> | undefined
  showMore?: React.ComponentType<ShowMoreProps<TEvent>>
}

interface ViewOverrideComponents<TEvent extends CalendarEvent = CalendarEvent> {
  agenda?:
			| {
			  date?: React.ComponentType | undefined
			  time?: React.ComponentType | undefined
			  event?: React.ComponentType<EventProps<TEvent>> | undefined
			}
			| undefined
  day?:
			| {
			  header?: React.ComponentType<HeaderProps> | undefined
			  event?: React.ComponentType<EventProps<TEvent>> | undefined
			}
			| undefined
  week?:
			| {
			  header?: React.ComponentType<HeaderProps> | undefined
			  event?: React.ComponentType<EventProps<TEvent>> | undefined
			}
			| undefined
  work_week?:
			| {
			  header?: React.ComponentType<HeaderProps> | undefined
			  event?: React.ComponentType<EventProps<TEvent>> | undefined
			}
			| undefined
  month?:
			| {
			  header?: React.ComponentType<HeaderProps> | undefined
			  dateHeader?: React.ComponentType<DateHeaderProps> | undefined
			  event?: React.ComponentType<EventProps<TEvent>> | undefined
			}
			| undefined
}

export interface Components<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> extends CommonComponents<TEvent, TResource>, ViewOverrideComponents<TEvent> {}

export type CompiledComponents<TEvent extends object = CalendarEvent, TResource extends object = object> = CommonComponents<TEvent, TResource> & (
  ViewOverrideComponents<TEvent>["agenda"] &
  ViewOverrideComponents<TEvent>["day"] &
  ViewOverrideComponents<TEvent>["week"] &
  ViewOverrideComponents<TEvent>["work_week"] &
  ViewOverrideComponents<TEvent>["month"]
)

const defaultComponents: CommonComponents = {
  eventWrapper: NoopWrapper,
  backgroundEventWrapper: NoopWrapper,
  eventContainerWrapper: NoopWrapper,
  dateCellWrapper: NoopWrapper,
  dayColumnWrapper: DayColumnWrapper,
  weekWrapper: NoopWrapper,
  timeslotWrapper: NoopWrapper,
  timeGutterWrapper: NoopWrapper,

  header: Header,
  resourceHeader: ResourceHeader,
}

const defaultViewOverrideComponents: ViewOverrideComponents = {
  agenda: {
    date: NoopWrapper,
    time: NoopWrapper,
    event: NoopWrapper,
  },
  day: {
    header: Header,
    event: NoopWrapper,
  },
  week: {
    header: Header,
    event: NoopWrapper,
  },
  work_week: {
    header: Header,
    event: NoopWrapper,
  },
  month: {
    header: Header,
    dateHeader: DateHeader,
    event: NoopWrapper,
  },
}

export const initComponents = <TEvent extends object = CalendarEvent, TResource extends object = object>(
  components: Components<TEvent, TResource> | undefined,
  view: ViewName,
  viewNames: string[]
) => {
  return defaults(
    components?.[view] || {},
    omit(components, viewNames),
    defaultComponents,
    defaultViewOverrideComponents[view],
  )
}
