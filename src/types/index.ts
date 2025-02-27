import React from "react"
import { DateHeaderProps } from "../DateHeader"
import { HeaderProps } from "../Header"
import { DateLocalizer } from "../localizers"
import { ResourceHeaderProps } from "../ResourceHeader"

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

export type DayPropGetter = (date: Date, resourceId?: number | string) => React.HTMLAttributes<HTMLDivElement>;
export type EventPropGetter<T> = (
  event: T,
  start: Date,
  end: Date,
  isSelected: boolean,
) => { className?: string | undefined, style?: React.CSSProperties };
export type SlotPropGetter = (date: Date, resourceId?: number | string) => React.HTMLAttributes<HTMLDivElement>;
export type SlotGroupPropGetter = () => React.HTMLAttributes<HTMLDivElement>;

export type Getters<TEvent extends object = Event> = {
  eventProp?: EventPropGetter<TEvent> | undefined
  slotProp?: SlotPropGetter | undefined
  dayProp?: DayPropGetter | undefined
  slotGroupProp?: SlotGroupPropGetter | undefined
}

export type Accessors<TEvent extends object = Event> = {
  title?: ((event: TEvent) => string) | undefined
  tooltip?: ((event: TEvent) => string) | undefined
  end?: ((event: TEvent) => Date) | undefined
  start?: ((event: TEvent) => Date) | undefined
}

export interface Components<TEvent extends object = Event, TResource extends object = object> {
  event?: React.ComponentType<EventProps<TEvent>> | undefined
  eventWrapper?: React.ComponentType<EventWrapperProps<TEvent>> | undefined
  eventContainerWrapper?: React.ComponentType | undefined
  dateCellWrapper?: React.ComponentType<DateCellWrapperProps> | undefined
  dayColumnWrapper?: React.ComponentType | undefined
  timeSlotWrapper?: React.ComponentType | undefined
  timeGutterHeader?: React.ComponentType | undefined
  timeGutterWrapper?: React.ComponentType | undefined
  toolbar?: React.ComponentType | undefined
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
  /**
	 * component used as a header for each column in the TimeGridHeader
	 */
  header?: React.ComponentType<HeaderProps> | undefined
  resourceHeader?: React.ComponentType<ResourceHeaderProps<TResource>> | undefined
  showMore?: React.ComponentType<ShowMoreProps<TEvent>>
}

export interface EventProps<TEvent extends object = Event> {
  event: TEvent
  title: string
  continuesPrior: boolean
  continuesAfter: boolean
  isAllDay?: boolean
  localizer: DateLocalizer
  slotStart: Date
  slotEnd: Date
}

export interface EventWrapperProps<TEvent extends object = Event> {
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

export interface DateCellWrapperProps {
  range: Date[]
  value: Date
  children: React.JSX.Element
}

export interface ShowMoreProps<TEvent extends object = Event> {
  localizer: DateLocalizer
  slot: number
  slotDate: Date
  count: number
  events: TEvent[]
  remainingEvents: TEvent[]
}
