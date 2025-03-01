import clsx from 'clsx'
import React, { useCallback, useMemo } from 'react'
import { uncontrollable } from 'uncontrollable'

import { Culture, Formats, mergeWithDefaults } from './localizers'
import NoopWrapper from './NoopWrapper'
import Toolbar, { ToolbarProps } from './Toolbar'
import { navigate, NavigateAction } from './utils/constants'
import { notify } from './utils/helpers'
import { buildMessages, Messages } from './utils/messages'
import moveDate from './utils/move'
import VIEWS, {
  ViewComponent,
  BaseViewProps,
  View,
  views as viewStrings,
  type ViewsProps,
} from '@/Views'

import defaults from 'lodash/defaults'
import mapValues from 'lodash/mapValues'
import omit from 'lodash/omit'
import transform from 'lodash/transform'
import { Accessors, wrapAccessor } from './utils/accessors'
import { DateLocalizer } from './localizers'
import { CalendarEvent, Components, DayPropGetter, EventPropGetter, Getters, SlotGroupPropGetter, SlotInfo, SlotPropGetter } from './types'
import { DayLayoutFunction, DayLayoutAlgorithm } from './utils/layout-algorithms/types'

declare const process: {
  env: {
    NODE_ENV: string
  }
}

interface CalendarState<TEvent extends object = Event, TResource extends object = object> {
  context: {
    viewNames: string[]
    localizer: DateLocalizer
    getters: Getters<TEvent>
    components: Components<TEvent, TResource>
    accessors: Accessors<TEvent>
  }
}

function viewNames(_views: View[] | Record<string, boolean | React.ComponentType>): string[] {
  if(Array.isArray(_views)) {
    return _views
  }
  const views: string[] = []
  for(const [key, value] of Object.entries(_views)) {
    if(value) {
      views.push(key)
    }
  }
  return views
}

function isValidView(view: View, { views: _views }: { views: View[] | Record<string, boolean | React.ComponentType> }): boolean {
  const names = viewNames(_views)
  return names.indexOf(view) !== -1
}

export interface CalendarProps<TEvent extends object = Event, TResource extends object = object> {
  children?: React.ReactNode
  className?: string | undefined
  style?: React.CSSProperties | undefined

  /**
   * The localizer used for formatting dates and times according to the `format` and `culture`
   *
   * globalize
   * ```js
   * import {globalizeLocalizer} from 'react-big-calendar'
   * import globalize from 'globalize'
   *
   * const localizer = globalizeLocalizer(globalize)
   * ```
   * moment
   * ``js
   * import {momentLocalizer} from 'react-big-calendar'
   * import moment from 'moment'
   * // and, for optional time zone support
   * import 'moment-timezone'
   *
   * moment.tz.setDefault('America/Los_Angeles')
   * // end optional time zone support
   *
   * const localizer = momentLocalizer(moment)
   * ```
   *
   * Luxon
   * ```js
   * import {luxonLocalizer} from 'react-big-calendar'
   * import {DateTime, Settings} from 'luxon'
import useMemo from 'react';
    * // only use `Settings` if you require optional time zone support
    * Settings.defaultZone = 'America/Los_Angeles'
    * // end optional time zone support
    *
    * // Luxon uses the Intl API, which currently does not contain `weekInfo`
    * // to determine which weekday is the start of the week by `culture`.
    * // The `luxonLocalizer` defaults this to Sunday, which differs from
    * // the Luxon default of Monday. The localizer requires this option
    * // to change the display, and the date math for determining the
    * // start of a week. Luxon uses non-zero based values for `weekday`.
    * const localizer = luxonLocalizer(DateTime, {firstDayOfWeek: 7})
    * ```
    */
  localizer: DateLocalizer

  /**
   * Props passed to main calendar `<div>`.
   *
   */
  elementProps?: React.HTMLAttributes<HTMLElement> | undefined

  /**
   * The current date value of the calendar. Determines the visible view range.
   * If `date` is omitted then the result of `getNow` is used otherwise the
   * current date is used.
   *
   * @controllable onNavigate
   */
  date?: string | Date | undefined

  /**
   * The current view of the calendar.
   *
   * @default 'month'
   * @controllable onView
   */
  view?: View | undefined

  /**
   * The initial view set for the Calendar.
   * @type Calendar.Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @default 'month'
   */
  defaultView?: View | undefined

  /**
   * An array of event objects to display on the calendar. Events objects
   * can be any shape, as long as the Calendar knows how to retrieve the
   * following details of the event:
   *
   *  - start time
   *  - end time
   *  - title
   *  - whether its an "all day" event or not
   *  - any resource the event may be related to
   *
   * Each of these properties can be customized or generated dynamically by
   * setting the various "accessor" props. Without any configuration the default
   * event should look like:
   *
   * ```js
   * Event {
   *   title: string,
   *   start: Date,
   *   end: Date,
   *   allDay?: boolean
   *   resource?: any,
   * }
   * ```
   */
  events?: TEvent[] | undefined

  /**
   * An array of background event objects to display on the calendar. Background
   * Events behave similarly to Events but are not factored into Event overlap logic,
   * allowing them to sit behind any Events that may occur during the same period.
   * Background Events objects can be any shape, as long as the Calendar knows how to
   * retrieve the following details of the event:
   *
   *  - start time
   *  - end time
   *
   * Each of these properties can be customized or generated dynamically by
   * setting the various "accessor" props. Without any configuration the default
   * event should look like:
   *
   * ```js
   * BackgroundEvent {
   *   start: Date,
   *   end: Date,
   * }
   * ```
   */
  backgroundEvents?: TEvent[] | undefined

  /**
   * Accessor for the event title, used to display event information. Should
   * resolve to a `renderable` value.
   *
   * ```js
   * string | (event: Object) => string
   * ```
   *
   * @type {(func|string)}
   */
  titleAccessor?: keyof TEvent | ((event: TEvent) => string) | undefined

  /**
   * Accessor for the event tooltip. Should
   * resolve to a `renderable` value. Removes the tooltip if null.
   *
   * ```js
   * string | (event: Object) => string
   * ```
   *
   * @type {(func|string)}
   */
  tooltipAccessor?: keyof TEvent | ((event: TEvent) => string) | null | undefined

  /**
   * Determines whether the event should be considered an "all day" event and ignore time.
   * Must resolve to a `boolean` value.
   *
   * ```js
   * string | (event: Object) => boolean
   * ```
   *
   * @type {(func|string)}
   */
  allDayAccessor?: keyof TEvent | ((event: TEvent) => boolean) | undefined

  /**
   * The start date/time of the event. Must resolve to a JavaScript `Date` object.
   *
   * ```js
   * string | (event: Object) => Date
   * ```
   *
   * @type {(func|string)}
   */
  startAccessor?: keyof TEvent | ((event: TEvent) => Date) | undefined

  /**
   * The end date/time of the event. Must resolve to a JavaScript `Date` object.
   *
   * ```js
   * string | (event: Object) => Date
   * ```
   *
   * @type {(func|string)}
   */
  endAccessor?: keyof TEvent | ((event: TEvent) => Date) | undefined

  /**
   * The id of the event. Must resolve to a string or number. Used as the key for the event in the DOM. If not provided, the event will be given a key of 'evt\_{index}'.
   *
   * ```js
   * string | number | (event: Object) => string | number
   * ```
   *
   * @type {(func|string)}
   */
  eventIdAccessor?: keyof TEvent | ((event: TEvent) => any) | undefined

  /**
   * Returns the id of the `resource` that the event is a member of. This
   * id should match at least one resource in the `resources` array.
   *
   * ```js
   * string | (event: Object) => Date
   * ```
   *
   * @type {(func|string)}
   */
  resourceAccessor?: keyof TEvent | ((event: TEvent) => any) | undefined

  /**
   * An array of resource objects that map events to a specific resource.
   * Resource objects, like events, can be any shape or have any properties,
   * but should be uniquly identifiable via the `resourceIdAccessor`, as
   * well as a "title" or name as provided by the `resourceTitleAccessor` prop.
   */
  resources?: TResource[] | undefined

  /**
   * Provides a unique identifier, or an array of unique identifiers, for each resource in the `resources` array
   *
   * ```js
   * string | (resource: Object) => any
   * ```
   *
   * @type {(func|string)}
   */
  resourceIdAccessor?: keyof TResource | ((resource: TResource) => any) | undefined

  /**
   * Provides a human readable name for the resource object, used in headers.
   *
   * ```js
   * string | (resource: Object) => any
   * ```
   *
   * @type {(func|string)}
   */
  resourceTitleAccessor?: keyof TResource | ((resource: TResource) => any) | undefined

  /**
   * Determines the current date/time which is highlighted in the views.
   *
   * The value affects which day is shaded and which time is shown as
   * the current time. It also affects the date used by the Today button in
   * the toolbar.
   *
   * Providing a value here can be useful when you are implementing time zones
   * using the `startAccessor` and `endAccessor` properties.
   *
   * @type {func}
   * @default () => new Date()
   */
  getNow?: () => string | Date | undefined

  /**
   * Callback fired when the `date` value changes.
   *
   * @controllable date
   */
  onNavigate?: ((newDate: Date, view: View, action: NavigateAction) => void) | undefined

  /**
   * Callback fired when the `view` value changes.
   *
   * @controllable view
   */
  onView?: ((view: View) => void) | undefined

  /**
   * Callback fired when date header, or the truncated events links are clicked
   *
   */
  onDrillDown?: ((date: Date, view: View, drilldownView?: View) => void) | undefined

  /**
   *
   * ```js
   * (dates: Date[] | { start: Date end: Date }, view: 'month'|'week'|'work_week'|'day'|'agenda'|undefined) => void
   * ```
   *
   * Callback fired when the visible date range changes. Returns an Array of dates
   * or an object with start and end dates for BUILTIN views. Optionally new `view`
   * will be returned when callback called after view change.
   *
   * Custom views may return something different.
   */
  onRangeChange?: (range: Date[] | { start: Date, end: Date }, view?: View) => void | undefined

  /**
   * A callback fired when a date selection is made. Only fires when `selectable` is `true`.
   *
   * ```js
   * (
   *   slotInfo: {
   *     start: Date,
   *     end: Date,
   *     resourceId:  (number|string),
   *     slots: Array<Date>,
   *     action: "select" | "click" | "doubleClick",
   *     bounds: ?{ // For "select" action
   *       x: number,
   *       y: number,
   *       top: number,
   *       right: number,
   *       left: number,
   *       bottom: number,
   *     },
   *     box: ?{ // For "click" or "doubleClick" actions
   *       clientX: number,
   *       clientY: number,
   *       x: number,
   *       y: number,
   *     },
   *   }
   * ) => any
   * ```
   */
  onSelectSlot?: ((slotInfo: SlotInfo) => void) | undefined

  /**
   * Callback fired when a calendar event is selected.
   *
   * ```js
   * (event: Object, e: SyntheticEvent) => any
   * ```
   *
   * @controllable selected
   */
  onSelectEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined

  /**
   * Callback fired when a calendar event is clicked twice.
   *
   * ```js
   * (event: Object, e: SyntheticEvent) => void
   * ```
   */
  onDoubleClickEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined

  /**
   * Callback fired when a focused calendar event receives a key press.
   *
   * ```js
   * (event: Object, e: SyntheticEvent) => void
   * ```
   */
  onKeyPressEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined

  /**
   * Callback fired when dragging a selection in the Time views.
   *
   * Returning `false` from the handler will prevent a selection.
   *
   * ```js
   * (range: { start: Date, end: Date, resourceId: (number|string) }) => ?boolean
   * ```
   */
  onSelecting?: (range: { start: Date, end: Date }) => boolean | undefined

  /**
   * Callback fired when a +{count} more is clicked
   *
   * ```js
   * (events: Object, date: Date) => any
   * ```
   */
  onShowMore?: ((events: TEvent[], date: Date) => void) | undefined

  /**
   * Displays all events on the month view instead of
   * having some hidden behind +{count} more. This will
   * cause the rows in the month view to be scrollable if
   * the number of events exceed the height of the row.
   */
  showAllEvents?: boolean | undefined

  /**
   * The selected event, if any.
   */
  // TODO: @types had this typed as any
  selected?: TEvent | undefined

  /**
   * An array of built-in view names to allow the calendar to display.
   * accepts either an array of builtin view names,
   *
   * ```jsx
   * views={['month', 'day', 'agenda']}
   * ```
   * or an object hash of the view name and the component (or boolean for builtin).
   *
   * ```jsx
   * views={{
   *   month: true,
   *   week: false,
   *   myweek: WorkWeekViewComponent,
   * }}
   * ```
   *
   * Custom views can be any React component, that implements the following
   * interface:
   *
   * ```js
   * interface View {
   *   static title(date: Date, { formats: DateFormat[], culture: string?, ...props }): string
   *   static navigate(date: Date, action: 'PREV' | 'NEXT' | 'DATE'): Date
   * }
   * ```
   *
   * @type Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @View
   ['month', 'week', 'day', 'agenda']
   */
  views?: View[] | undefined

  /**
   * Determines whether the drill down should occur when clicking on the "+_x_ more" link.
   * If `popup` is false, and `doShowMoreDrillDown` is true, the drill down will occur as usual.
   * If `popup` is false, and `doShowMoreDrillDown` is false, the drill down will not occur and the `onShowMore` function will trigger.
   */
  doShowMoreDrillDown?: boolean | undefined

  /**
   * The string name of the destination view for drill-down actions, such
   * as clicking a date header, or the truncated events links. If
   * `getDrilldownView` is also specified it will be used instead.
   *
   * Set to `null` to disable drill-down actions.
   *
   * ```js
   * <Calendar
   *   drilldownView="agenda"
   * />
   * ```
   */
  drilldownView?: View | null | undefined

  /**
   * Functionally equivalent to `drilldownView`, but accepts a function
   * that can return a view name. It's useful for customizing the drill-down
   * actions depending on the target date and triggering view.
   *
   * Return `null` to disable drill-down actions.
   *
   * ```js
   * <Calendar
   *   getDrilldownView={(targetDate, currentViewName, configuredViewNames) =>
   *     if (currentViewName === 'month' && configuredViewNames.includes('week'))
   *       return 'week'
   *
   *     return null
   *   }}
   * />
   * ```
   */
  getDrilldownView?:
    | ((targetDate: Date, currentViewName: View, configuredViewNames: View[]) => void)
    | null
    | undefined

  /**
   * Determines the end date from date prop in the agenda view
   * date prop + length (in number of days) = end date
   */
  length?: number | undefined

  /**
   * Determines whether the toolbar is displayed
   */
  toolbar?: boolean | undefined

  /**
   * Show truncated events in an overlay when you click the "+_x_ more" link.
   */
  popup?: boolean | undefined

  /**
   * Distance in pixels, from the edges of the viewport, the "show more" overlay should be positioned.
   *
   * ```jsx
   * <Calendar popupOffset={30}/>
   * <Calendar popupOffset={{x: 30, y: 20}}/>
   * ```
   */
  popupOffset?: number | { x: number, y: number } | undefined

  /**
   * Allows mouse selection of ranges of dates/times.
   *
   * The 'ignoreEvents' option prevents selection code from running when a
   * drag begins over an event. Useful when you want custom event click or drag
   * logic
   */
  selectable?: boolean | "ignoreEvents" | undefined

  /**
   * Specifies the number of milliseconds the user must press and hold on the screen for a touch
   * to be considered a "long press." Long presses are used for time slot selection on touch
   * devices.
   *
   * @type {number}
   * @default 250
   */
  longPressThreshold?: number | undefined

  /**
   * Determines the selectable time increments in week and day views, in minutes.
   */
  step?: number | undefined

  /**
   * The number of slots per "section" in the time grid views. Adjust with `step`
   * to change the default of 1 hour long groups, with 30 minute slots.
   */
  timeslots?: number | undefined

  /**
   *Switch the calendar to a `right-to-left` read direction.
   */
  rtl?: boolean | undefined

  /**
   * Optionally provide a function that returns an object of className or style props
   * to be applied to the the event node.
   *
   * ```js
   * (
   * 	event: Object,
   * 	start: Date,
   * 	end: Date,
   * 	isSelected: boolean
   * ) => { className?: string, style?: Object }
   * ```
   */
  eventPropGetter?: EventPropGetter<TEvent> | undefined

  /**
   * Optionally provide a function that returns an object of className or style props
   * to be applied to the time-slot node. Caution! Styles that change layout or
   * position may break the calendar in unexpected ways.
   *
   * ```js
   * (date: Date, resourceId: (number|string)) => { className?: string, style?: Object }
   * ```
   */
  slotPropGetter?: SlotPropGetter | undefined

  /**
   * Optionally provide a function that returns an object of props to be applied
   * to the time-slot group node. Useful to dynamically change the sizing of time nodes.
   * ```js
   * (group: Date[]) => { style?: Object }
   * ```
   */
  slotGroupPropGetter?: SlotGroupPropGetter | undefined

  /**
   * Optionally provide a function that returns an object of className or style props
   * to be applied to the the day background. Caution! Styles that change layout or
   * position may break the calendar in unexpected ways.
   *
   * ```js
   * (date: Date) => { className?: string, style?: Object }
   * ```
   */
  dayPropGetter?: DayPropGetter | undefined

  /**
   * Support to show multi-day events with specific start and end times in the
   * main time grid (rather than in the all day header).
   *
   * **Note: This may cause calendars with several events to look very busy in
   * the week and day views.**
   */
  showMultiDayTimes?: boolean | undefined

  /**
   * Determines a maximum amount of rows of events to display in the all day
   * section for Week and Day views, will display `showMore` button if
   * events exceed this number.
   *
   * Defaults to `Infinity`
   */
  allDayMaxRows?: number | undefined

  /**
   * Constrains the minimum _time_ of the Day and Week views.
   */
  min?: Date | undefined

  /**
   * Constrains the maximum _time_ of the Day and Week views.
   */
  max?: Date | undefined

  /**
   * Determines how far down the scroll pane is initially scrolled down.
   */
  scrollToTime?: Date | undefined

  /**
   * Determines whether the scroll pane is automatically scrolled down or not.
   */
  enableAutoScroll?: boolean | undefined

  /**
   * Determines the layout of resource groups in the calendar.
   * When `true`, resources will be grouped by date in the week view.
   * When `false`, resources will be grouped by week.
   */
  resourceGroupingLayout?: boolean | undefined

  /**
   * Specify a specific culture code for the Calendar.
   *
   * **Note: it's generally better to handle this globally via your i18n library.**
   */
  culture?: Culture | undefined

  /**
   * Localizer specific formats, tell the Calendar how to format and display dates.
   *
   * `format` types are dependent on the configured localizer Moment, Luxon and Globalize
   * accept strings of tokens according to their own specification, such as: `'DD mm yyyy'`.
   *
   * ```jsx
   * let formats = {
   *   dateFormat: 'dd',
   *
   *   dayFormat: (date, , localizer) =>
   *     localizer.format(date, 'DDD', culture),
   *
   *   dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
   *     localizer.format(start, { date: 'short' }, culture) + ' – ' +
   *     localizer.format(end, { date: 'short' }, culture)
   * }
   *
   * <Calendar formats={formats} />
   * ```
   *
   * All localizers accept a function of
   * the form `(date: Date, culture: ?string, localizer: Localizer) -> string`
   */
  formats?: Formats | undefined

  /**
     * Customize how different sections of the calendar render by providing custom Components.
     * In particular the `Event` component can be specified for the entire calendar, or you can
     * provide an individual component for each view type.
     *
     * ```jsx
     * let components = {
     *   event: MyEvent, // used by each view (Month, Day, Week)
     *   eventWrapper: MyEventWrapper,
     *   eventContainerWrapper: MyEventContainerWrapper,
     *   dateCellWrapper: MyDateCellWrapper,
     *   timeslotWrapper: MyTimeSlotWrapper,
     *   timeGutterHeader: MyTimeGutterWrapper,
     *   timeGutterWrapper: MyTimeGutterWrapper,
     *   resourceHeader: MyResourceHeader,
     *   showMore: MyShowMoreEvent,
     *   toolbar: MyToolbar,
     *   agenda: {
     *   	 event: MyAgendaEvent, // with the agenda view use a different component to render events
     *     time: MyAgendaTime,
     *     date: MyAgendaDate,
     *   },
     *   day: {
     *     header: MyDayHeader,
     *     event: MyDayEvent,
     *   },
     *   week: {
     *     header: MyWeekHeader,
     *     event: MyWeekEvent,
     *   },
     *   month: {
     *     header: MyMonthHeader,
     *     dateHeader: MyMonthDateHeader,
     *     event: MyMonthEvent,
     *   }
     * }
     * <Calendar components={components} />
     * ```
     */
  components?: Components<TEvent, TResource> | undefined

  /**
     * String messages used throughout the component, override to provide localizations
     *
     * ```jsx
     * const messages = {
     *   date: 'Date',
     *   time: 'Time',
     *   event: 'Event',
     *   allDay: 'All Day',
     *   week: 'Week',
     *   work_week: 'Work Week',
     *   day: 'Day',
     *   month: 'Month',
     *   previous: 'Back',
     *   next: 'Next',
     *   yesterday: 'Yesterday',
     *   tomorrow: 'Tomorrow',
     *   today: 'Today',
     *   agenda: 'Agenda',
     *
     *   noEventsInRange: 'There are no events in this range.',
     *
     *   showMore: total => `+ ${total} more`,
     * }
     *
     * <Calendar messages={messages} />
     * ```
     */
  messages?: Messages<TEvent> | undefined

  /**
     * A day event layout(arrangement) algorithm.
     *
     * `overlap` allows events to be overlapped.
     *
     * `no-overlap` resizes events to avoid overlap.
     *
     * or custom `Function(events, minimumStartDifference, slotMetrics, accessors)`
     */
  dayLayoutAlgorithm?: DayLayoutAlgorithm | DayLayoutFunction<TEvent> | undefined
}

const Calendar = <TEvent extends object = Event, TResource extends object = object>(props
: CalendarProps<TEvent, TResource>) => {

    const {
      date,
      events = [],
      backgroundEvents = [],
      elementProps = {},
      popup = false,
      toolbar = true,
      view = viewStrings.MONTH,
      views = [viewStrings.MONTH, viewStrings.WEEK, viewStrings.DAY, viewStrings.AGENDA],
      step = 30,
      length = 30,
      allDayMaxRows = Infinity,
      doShowMoreDrillDown = true,
      drilldownView = viewStrings.DAY,
      getDrilldownView,
      titleAccessor = 'title',
      tooltipAccessor = 'title',
      allDayAccessor = 'allDay',
      startAccessor = 'start',
      endAccessor = 'end',
      resourceAccessor = 'resourceId',
  
      resourceIdAccessor = 'id',
      resourceTitleAccessor = 'title',
  
      eventIdAccessor = 'id',
  
      longPressThreshold = 250,
      getNow = () => new Date(),
      dayLayoutAlgorithm = 'overlap',
      className,
      rtl,
      style,
      onRangeChange,
      onNavigate,
      onSelectEvent,
      onDoubleClickEvent,
      onKeyPressEvent,
      onSelectSlot,
      onSelecting,
      onShowMore,
      onView,
      onDrillDown,
      showMultiDayTimes,
      messages,
      formats,
      culture,
      min,
      max,
      scrollToTime,
      enableAutoScroll,
      eventPropGetter,
      slotPropGetter,
      slotGroupPropGetter,
      dayPropGetter,
      showAllEvents,
      selectable,
      resourceGroupingLayout,
    } = props
    const localizer = mergeWithDefaults(props?.localizer, culture, formats, messages)

  const localizer = mergeWithDefaults(props?.localizer, culture, formats, messages)

  const context = useMemo(() => {
    const names = viewNames(viewsProp || [])
    const msgs = buildMessages(messages)
  
    return {
      viewNames: names,
      localizer: mergeWithDefaults(localizer, culture, formats, msgs),
      getters: {
        eventProp: (event: TEvent, start: Date, end: Date, isSelected: boolean) =>
          (eventPropGetter && eventPropGetter(event, start, end, isSelected)) || {},
        slotProp: (date: Date, resourceId?: string) =>
          (slotPropGetter && slotPropGetter(date, resourceId)) || {},
        slotGroupProp: (...args: Parameters<NonNullable<typeof slotGroupPropGetter>>) =>
          (slotGroupPropGetter && slotGroupPropGetter(...args)) || {},
        dayProp: (date: Date) =>
          (dayPropGetter && dayPropGetter(date)) || {},
      },
      components: defaults(components[view] || {}, omit(components, names), {
        eventWrapper: NoopWrapper,
        backgroundEventWrapper: NoopWrapper,
        eventContainerWrapper: NoopWrapper,
        dateCellWrapper: NoopWrapper,
        weekWrapper: NoopWrapper,
        timeSlotWrapper: NoopWrapper,
        timeGutterWrapper: NoopWrapper,
      }),
      accessors: {
        start: wrapAccessor(startAccessor),
        end: wrapAccessor(endAccessor),
        allDay: wrapAccessor(allDayAccessor),
        tooltip: wrapAccessor(tooltipAccessor),
        title: wrapAccessor(titleAccessor),
        resource: wrapAccessor(resourceAccessor),
        resourceId: wrapAccessor(resourceIdAccessor),
        resourceTitle: wrapAccessor(resourceTitleAccessor),
        eventId: wrapAccessor(eventIdAccessor),
      },
    }, [view, events, backgroundEvents, current, getNow, length, props])

  const getViews = useCallback(() => {
    const viewsProp = props.views || Object.values(views)

    if(Array.isArray(viewsProp)) {
      return transform(viewsProp, (obj, name) => {
        if(typeof name === 'string' && name in VIEWS) {
          obj[name] = VIEWS[name as keyof typeof VIEWS] as ViewComponent<BaseViewProps>
        }
      }, {} as Record<string, ViewComponent<BaseViewProps>>)
    }

    if(typeof viewsProp === 'object' && viewsProp !== null) {
      return mapValues(viewsProp as Record<string, boolean | ViewComponent<BaseViewProps>>, (value, key) => {
        if(value === true && key in VIEWS) {
          return VIEWS[key as keyof typeof VIEWS] as ViewComponent<BaseViewProps>
        }
        return value as ViewComponent<BaseViewProps>
      })
    }

    return VIEWS
  }, [props.views])

  const getView = useCallback(() => {
    const viewsObj = getViews()
    return viewsObj[view] as ViewComponent<BaseViewProps>
  }, [getViews, view])

  const handleGetDrilldownView = useCallback((date: Date) => {
    if(!getDrilldownView) return drilldownView
    const viewKeys = Object.keys(getViews()) as View[]
    const result = getDrilldownView(date, view, viewKeys)
    return result || drilldownView
  }, [getDrilldownView, drilldownView, view, getViews])

  const handleRangeChange = useCallback((date: Date, viewComponent: ViewComponent<BaseViewProps>, view?: View) => {
    if(onRangeChange && viewComponent.range) {
      onRangeChange(viewComponent.range(date, { localizer: context.localizer }), view)
    } else if(process.env.NODE_ENV !== 'production') {
      console.error('onRangeChange prop not supported for this view')
    }
  }, [onRangeChange, context.localizer])

  const handleNavigate = useCallback((action: NavigateAction, newDate?: Date) => {
    const ViewComponent = getView()
    const today = getNow()
    const currentDate = new Date(current || today)

    const navigatedDate = moveDate(ViewComponent as unknown as ViewStatic, {
      action,
      date: newDate || currentDate,
      today,
      props: { localizer: context.localizer },
    })

    if(onNavigate) {
      onNavigate(navigatedDate, view, action)
    }
    handleRangeChange(navigatedDate, ViewComponent)
  }, [getView, getNow, current, onNavigate, view, handleRangeChange, context.localizer])

  const handleViewChange = useCallback((newView: View) => {
    const viewsConfig = props.views || Object.values(views)
    if(newView !== view && isValidView(newView, { views: viewsConfig })) {
      onView?.(newView)
    }

    const viewsObj = getViews()
    const currentDate = new Date(current || getNow())
    handleRangeChange(currentDate, viewsObj[newView] as ViewComponent<BaseViewProps>, newView)
  }, [view, props.views, onView, current, getNow, handleRangeChange, getViews])

  const handleSelectEvent = useCallback((event: TEvent, e: React.SyntheticEvent) => {
    notify(onSelectEvent, [event, e])
  }, [onSelectEvent])

  const handleDoubleClickEvent = useCallback((event: TEvent, e: React.SyntheticEvent) => {
    notify(onDoubleClickEvent, [event, e])
  }, [onDoubleClickEvent])

  const handleKeyPressEvent = useCallback((event: TEvent, e: React.KeyboardEvent) => {
    notify(onKeyPressEvent, [event, e])
  }, [onKeyPressEvent])

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    notify(onSelectSlot, slotInfo)
  }, [onSelectSlot])

  const handleDrillDown = useCallback((date: Date, drillView?: View) => {
    if(onDrillDown) {
      const nextView = getDrilldownView(date)
      onDrillDown(date, drillView, nextView)
      return
    }
    if(drillView) handleViewChange(drillView)
    handleNavigate(navigate.DATE, date)
  }, [onDrillDown, getDrilldownView, handleViewChange, handleNavigate])

  const View = getView()

  const CalToolbar = components.toolbar || Toolbar
  const currentDate = new Date(current || getNow())

  const rangeFormat: DateRangeFormatFunction = (range: DateRange) => {
    const start = range.start instanceof Date ? range.start : new Date(range.start)
    const end = range.end instanceof Date ? range.end : new Date(range.end)
    return `${start.toLocaleString()} - ${end.toLocaleString()}`
  }

  const formats: Formats = {
    dateFormat: 'dd',
    dayFormat: 'dd ddd',
    weekdayFormat: 'dd',
    selectRangeFormat: rangeFormat,
    timeGutterFormat: 'HH:mm',
    monthHeaderFormat: 'MMMM yyyy',
    dayHeaderFormat: 'dddd MMM dd',
    dayRangeHeaderFormat: rangeFormat,
    agendaHeaderFormat: rangeFormat,
    agendaDateFormat: 'ddd MMM dd',
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: rangeFormat,
  }

  const formatsList: DateFormat[] = [
    formats.dateFormat,
    formats.dayFormat,
    formats.weekdayFormat,
    formats.timeGutterFormat,
    formats.monthHeaderFormat,
    formats.dayHeaderFormat,
    formats.agendaDateFormat,
    formats.agendaTimeFormat,
  ]

  const titleOptions = {
    localizer: localizer as DateLocalizer,
    length,
    formats: formatsList,
    culture: (props as unknown as { culture?: Culture }).culture,
  }

  const label = View.title(currentDate, {
    ...titleOptions,
    formats: formatsList.map(format => typeof format === 'string' ? format : format.toString()),
  } as unknown as CalendarProps<TEvent, TResource>)

  const toolbarProps: ToolbarProps = {
    date: currentDate,
    view,
    views: viewNames as View[],
    label,
    onView: handleViewChange,
    onNavigate: handleNavigate,
  }

  return (
    <div
      { ...elementProps }
      className={ clsx(className, 'rbc-calendar', props.rtl && 'rbc-rtl') }
      style={ style }
    >
      { toolbar && (
        <CalToolbar
          { ...toolbarProps }
        />
      ) }
      <View
        { ...props }
        events={ events }
        backgroundEvents={ backgroundEvents }
        date={ currentDate }
        getNow={ getNow }
        length={ length }
        localizer={ localizer }
        getters={ getters }
        components={ components }
        accessors={ accessors }
        showMultiDayTimes={ showMultiDayTimes }
        getDrilldownView={ handleGetDrilldownView }
        onNavigate={ handleNavigate }
        onDrillDown={ handleDrillDown }
        onSelectEvent={ handleSelectEvent }
        onDoubleClickEvent={ handleDoubleClickEvent }
        onKeyPressEvent={ handleKeyPressEvent }
        onSelectSlot={ handleSelectSlot }
        onShowMore={ onShowMore }
        doShowMoreDrillDown={ doShowMoreDrillDown }
        resourceGroupingLayout={ resourceGroupingLayout }
      />
    </div>
  )
}

export default uncontrollable(Calendar, {
  view: 'onView',
  date: 'onNavigate',
  selected: 'onSelectEvent',
})
