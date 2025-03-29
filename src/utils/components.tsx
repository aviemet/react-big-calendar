import { defaults, omit } from "lodash-es"

import { DateHeader } from "@/components/DateHeader"
import { DayColumnWrapper, DayColumnWrapperProps } from "@/components/DayColumnWrapper"
import { Header, ViewHeaderProps } from "@/components/Header"
import { NoopWrapper } from "@/components/NoopWrapper"
import { ResourceHeader, ResourceHeaderProps } from "@/components/ResourceHeader"
import { WeekdayHeader } from "@/components/TimeGrid/WeekdayHeader"
import { Toolbar, ToolbarProps } from "@/components/Toolbar"
import { DateSlotMetrics } from "@/hooks/useDateSlotMetrics"
import { TimeSlotMetrics } from "@/hooks/useTimeSlotMetrics"
import { DateLocalizer } from "@/localizers"
import { ViewName } from "@/Views"

import { Box } from "./eventSelectionHelpers"
import { Resource } from "./Resources"

export interface CalendarEvent {
  id?: string | number
  allDay?: boolean | undefined
  title?: React.ReactNode | undefined
  start?: Date | undefined
  end?: Date | undefined
  resource?: any
  style?: React.CSSProperties
}

export interface EventProps<TEvent extends object = CalendarEvent> {
  children?: React.ReactNode
  event: TEvent
  continuesPrior: boolean
  continuesAfter: boolean
  isAllDay?: boolean
  slotStart: Date
  slotEnd: Date
  title: string // Keeping for backwards compatibility
  localizer: DateLocalizer // Keeping for backwards compatibility
}

export interface SlotInfo {
  start: Date
  end: Date
  slots?: Date[]
  action: "select" | "click" | "doubleClick"
  /** For "TimeGrid" views */
  resourceId?: number | string | undefined
  /** For "select" action */
  bounds?: Box | undefined
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
  children: React.ReactNode
}

export interface TimeGutterWrapperProps {
  children?: React.ReactNode
  slotMetrics: TimeSlotMetrics
}

export interface TimeSlotWrapperProps {
  children?: React.ReactNode
  value: Date
  resource: string | number | null | undefined
}

export interface EventContainerProps {
  children?: React.ReactNode
  resourceId: string | number
  slotMetrics: TimeSlotMetrics
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
  children?: React.ReactNode
  event: TEvent
  resource?: number
  isRow?: boolean
  allDay?: boolean
  continuesPrior?: boolean
  continuesAfter?: boolean
  type?: "date" | "time"
}

export interface WeekWrapperProps<TEvent extends CalendarEvent = CalendarEvent> {
  children: React.ReactNode
  isAllDay?: boolean
  slotMetrics: DateSlotMetrics<TEvent>
  resourceId?: string | number
}

export interface CommonComponents<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  event: React.ComponentType<EventProps<TEvent>>
  backgroundEventWrapper: React.ComponentType<EventWrapperProps<TEvent>>
  eventWrapper: React.ComponentType<EventWrapperProps<TEvent>>
  eventContainerWrapper: React.ComponentType<EventContainerProps>
  dateCellWrapper: React.ComponentType<DateCellWrapperProps>
  dayColumnWrapper: React.ForwardRefExoticComponent<DayColumnWrapperProps & React.RefAttributes<HTMLDivElement>>
  weekWrapper?: React.ComponentType<WeekWrapperProps<TEvent>>
  timeslotWrapper: React.ComponentType<TimeSlotWrapperProps>
  timeGutterHeader: React.ComponentType
  timeGutterWrapper: React.ComponentType<TimeGutterWrapperProps>
  toolbar?: React.ComponentType<ToolbarProps>

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
