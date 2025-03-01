import React from "react"
import { DateHeaderProps } from "../DateHeader"
import { HeaderProps } from "../Header"
import { DateLocalizer } from "../localizers"
import { ResourceHeaderProps } from "../ResourceHeader"
import { Accessors } from "@/utils/accessors"

export interface Event {
  allDay?: boolean | undefined
  title?: React.ReactNode | undefined
  start?: Date | undefined
  end?: Date | undefined
  resource?: any
}
export interface DateRange {
  start: Date
  end: Date
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

export type Getters<TEvent extends object = Event> = {
  eventProp?: EventPropGetter<TEvent> | undefined
  slotProp?: SlotPropGetter | undefined
  dayProp?: DayPropGetter | undefined
  slotGroupProp?: SlotGroupPropGetter | undefined
}

export interface Components<TEvent extends object = Event, TResource extends object = object> {
  event?: React.ComponentType<EventProps<TEvent>> | undefined
  eventWrapper?: React.ComponentType<EventWrapperProps<TEvent>> | undefined
  eventContainerWrapper?: React.ComponentType | undefined
  dateCellWrapper?: React.ComponentType<DateCellWrapperProps> | undefined
  dayColumnWrapper?: React.ComponentType | undefined
  timeslotWrapper?: React.ComponentType | undefined
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


export type DayLayoutFunction<TEvent extends object = Event> = (_: {
  events: TEvent[]
  minimumStartDifference: number
  slotMetrics: any
  accessors: any
}) => Array<{ event: TEvent, style: React.CSSProperties }>
export type DayLayoutAlgorithm = "overlap" | "no-overlap"
export type NavigateAction = "PREV" | "NEXT" | "TODAY" | "DATE"
export interface Event {
  allDay?: boolean | undefined
  title?: React.ReactNode | undefined
  start?: Date | undefined
  end?: Date | undefined
  resource?: any
}
export interface DateRange {
  start: Date
  end: Date
}

export type DateFormatFunction = (date: Date, culture?: Culture, localizer?: DateLocalizer) => string
export type DateRangeFormatFunction = (range: DateRange, culture?: Culture, localizer?: DateLocalizer) => string
export type DateFormat = string | DateFormatFunction

export interface Formats {
  /**
     * Format for the day of the month heading in the Month view.
     * e.g. "01", "02", "03", etc
     */
  dateFormat?: DateFormat | undefined

  /**
     * A day of the week format for Week and Day headings,
     * e.g. "Wed 01/04"
     */
  dayFormat?: DateFormat | undefined

  /**
     * Week day name format for the Month week day headings,
     * e.g: "Sun", "Mon", "Tue", etc
     */
  weekdayFormat?: DateFormat | undefined

  /**
     * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
     */
  timeGutterFormat?: DateFormat | undefined

  /**
     * Toolbar header format for the Month view, e.g "2015 April"
     */
  monthHeaderFormat?: DateFormat | undefined

  /**
     * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
     */
  dayRangeHeaderFormat?: DateRangeFormatFunction | undefined

  /**
     * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
     */
  dayHeaderFormat?: DateFormat | undefined

  /**
     * Toolbar header format for the Agenda view, e.g. "4/1/2015 — 5/1/2015"
     */
  agendaHeaderFormat?: DateRangeFormatFunction | undefined

  /**
     * A time range format for selecting time slots, e.g "8:00am — 2:00pm"
     */
  selectRangeFormat?: DateRangeFormatFunction | undefined

  agendaDateFormat?: DateFormat | undefined
  agendaTimeFormat?: DateFormat | undefined
  agendaTimeRangeFormat?: DateRangeFormatFunction | undefined

  /**
     * Time range displayed on events.
     */
  eventTimeRangeFormat?: DateRangeFormatFunction | undefined

  /**
     * An optional event time range for events that continue onto another day
     */
  eventTimeRangeStartFormat?: DateRangeFormatFunction | undefined

  /**
     * An optional event time range for events that continue from another day
     */
  eventTimeRangeEndFormat?: DateRangeFormatFunction | undefined
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

export interface Components<TEvent extends object = Event, TResource extends object = object> {
  event?: React.ComponentType<EventProps<TEvent>> | undefined
  eventWrapper?: React.ComponentType<EventWrapperProps<TEvent>> | undefined
  eventContainerWrapper?: React.ComponentType | undefined
  dateCellWrapper?: React.ComponentType<DateCellWrapperProps> | undefined
  dayColumnWrapper?: React.ComponentType | undefined
  timeSlotWrapper?: React.ComponentType | undefined
  timeGutterHeader?: React.ComponentType | undefined
  timeGutterWrapper?: React.ComponentType | undefined
  toolbar?: React.ComponentType<ToolbarProps<TEvent, TResource>> | undefined
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

export interface TitleOptions {
  formats: DateFormat[]
  culture?: Culture | undefined
  [propName: string]: any
}

export interface ViewStatic {
  navigate(date: Date, action: NavigateAction, props: any): Date
  title(date: Date, options: TitleOptions): string
}

export interface MoveOptions {
  action: NavigateAction
  date: Date
  today: Date
}

export interface components {
  timeSlotWrapper: React.ComponentType
  dateCellWrapper: React.ComponentType
  eventWrapper: React.ComponentType<Event>
}

// export function move(View: ViewStatic | ViewKey, options: MoveOptions): Date
