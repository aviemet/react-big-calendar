import { DateLocalizer } from "@/localizers"
import { defaults, omit } from "lodash-es"
import { Accessors } from "./accessors"
import { DateHeader } from "@/components/DateHeader"
import { ResourceHeader, ResourceHeaderProps } from "@/components/ResourceHeader"
import { ViewName } from "@/Views"
import { NoopWrapper } from "@/components/NoopWrapper"
import { Header } from "@/components/Header"
import { DayColumnWrapper } from "@/components/DayColumnWrapper"
import { Resource } from "./Resources"
import { Toolbar, ToolbarProps } from "@/components/Toolbar"
import { ViewHeaderProps } from "@/components"
import { WeekdayHeader } from "@/components/WeekdayHeader"
import { TimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"

export interface CalendarEvent {
  allDay?: boolean | undefined
  title?: React.ReactNode | undefined
  start?: Date | undefined
  end?: Date | undefined
  resource?: any
  style?: React.CSSProperties
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

export interface TimeGutterWrapperProps {
  children: React.ReactNode
  slotMetrics: TimeSlotMetrics
}

export interface TimeSlotWrapperProps {
  children: React.ReactNode
  value: Date
  resource: string | number | null | undefined
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
  event: React.ComponentType<EventProps<TEvent>>
  backgroundEventWrapper: React.ComponentType<EventWrapperProps<TEvent>>
  eventWrapper: React.ComponentType<EventWrapperProps<TEvent>>
  eventContainerWrapper: React.ComponentType
  dateCellWrapper: React.ComponentType<DateCellWrapperProps>
  dayColumnWrapper: React.ComponentType
  weekWrapper: React.ComponentType
  timeslotWrapper: React.ComponentType<TimeSlotWrapperProps>
  timeGutterHeader: React.ComponentType
  timeGutterWrapper: React.ComponentType<TimeGutterWrapperProps>
  toolbar: React.ComponentType<ToolbarProps>

  // components used as a header for each column in the TimeGridHeader
  header?: React.ComponentType<ViewHeaderProps>
  resourceHeader?: React.ComponentType<ResourceHeaderProps<TResource>>
  showMore?: React.ComponentType<ShowMoreProps<TEvent>>
}

interface ViewOverrideComponents<TEvent extends CalendarEvent = CalendarEvent> {
  agenda?: {
    date?: React.ComponentType
    time?: React.ComponentType
    event?: React.ComponentType<EventProps<TEvent>>
  }
  day?: {
    header?: React.ComponentType<ViewHeaderProps>
    dateHeader?: React.ComponentType<ViewHeaderProps>
    event?: React.ComponentType<EventProps<TEvent>>
  }
  week?:{
    header?: React.ComponentType<ViewHeaderProps>
    dateHeader?: React.ComponentType<ViewHeaderProps>
    event?: React.ComponentType<EventProps<TEvent>>
  }
  work_week?:{
    header?: React.ComponentType<ViewHeaderProps>
    dateHeader?: React.ComponentType<ViewHeaderProps>
    event?: React.ComponentType<EventProps<TEvent>>
  }
  month?: {
    header?: React.ComponentType<ViewHeaderProps>
    dateHeader?: React.ComponentType<ViewHeaderProps>
    event?: React.ComponentType<EventProps<TEvent>>
  }
}

export interface Components<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> extends CommonComponents<TEvent, TResource>, ViewOverrideComponents<TEvent> {}

export type CompiledComponents<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> = CommonComponents<TEvent, TResource> & (
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
  timeGutterHeader: NoopWrapper,
  toolbar: Toolbar,

  header: Header,
  resourceHeader: ResourceHeader,
  event: NoopWrapper,
}

const defaultViewOverrideComponents: ViewOverrideComponents = {
  agenda: {
    date: NoopWrapper,
    time: NoopWrapper,
    event: NoopWrapper,
  },
  day: {
    header: Header,
    dateHeader: WeekdayHeader,
    event: NoopWrapper,
  },
  week: {
    header: Header,
    dateHeader: WeekdayHeader,
    event: NoopWrapper,
  },
  work_week: {
    header: Header,
    dateHeader: WeekdayHeader,
    event: NoopWrapper,
  },
  month: {
    header: Header,
    dateHeader: DateHeader,
    event: NoopWrapper,
  },
}

export const initComponents = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>(
  components: Partial<Components<TEvent, TResource>> | undefined,
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
