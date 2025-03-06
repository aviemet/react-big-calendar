import React, { useCallback, useMemo } from 'react'
import {
  DateLocalizer,
  DateRange,
  mergeWithDefaults,
  type Culture,
  type Formats,
} from '@/localizers'
import {
  navigate,
  NavigateAction,
} from '@/utils/move'
import { coerceDate } from '@/utils/helpers'
import moveDate from '@/utils/move'
import { DayLayoutAlgorithm, DayLayoutFunction } from '@/utils/layout-algorithms/types'
import { Messages } from '@/utils/messages'
import { transform } from 'lodash-es'
import { Accessors } from '@/utils/accessors'
import Toolbar from '@/Toolbar'
import VIEWS, {
  ViewComponent,
  ViewName,
  views as viewStrings,
} from '@/Views'
import clsx from 'clsx'
import { Resource } from './utils/Resources'
import createContext from './hooks/createContext'
import { useUncontrolled } from 'uncontrollable'
import {
  CalendarEvent,
  Components,
  DayPropGetter,
  EventPropGetter,
  Getters,
  initComponents,
  SlotGroupPropGetter,
  SlotInfo,
  SlotPropGetter,
} from './utils/components'

type CalendarContext = {
  localizer: DateLocalizer
  components: Components
  accessors: Accessors
  getters: Getters
  rtl: boolean
  date: Date
  getNow: () => Date
}

const [useCalendarContext, CalendarProvider] = createContext<CalendarContext>()
export { useCalendarContext }

export interface CalendarProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
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
   * import useMemo from 'react';
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
  view?: ViewName | undefined

  /**
   * The initial view set for the Calendar.
   * @type Calendar.Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @default 'month'
   */
  defaultView?: ViewName | undefined

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
  getNow?: (() => Date) | undefined

  /**
   * Callback fired when the `date` value changes.
   *
   * @controllable date
   */
  onNavigate?: ((newDate: Date, view: ViewName, action: NavigateAction) => void) | undefined

  /**
   * Callback fired when the `view` value changes.
   *
   * @controllable view
   */
  onView?: ((view: ViewName) => void) | undefined

  /**
   * Callback fired when date header, or the truncated events links are clicked
   *
   */
  onDrillDown?: ((date: Date, view: ViewName, drilldownView?: ViewName) => void) | undefined

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
  onRangeChange?: (range: Date[] | { start: Date, end: Date }, view?: ViewName) => void | undefined

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
  onSelecting?: (range: DateRange) => boolean | undefined

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
   *   myWeek: WorkWeekViewComponent,
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
   * @View ['month', 'week', 'day', 'agenda']
   */
  views?: ViewName[] | Record<ViewName, ViewComponent | boolean> | Record<string, ViewComponent> | undefined

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
  drilldownView?: ViewName | null | undefined

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
    | ((targetDate: Date, currentViewName: ViewName | string, configuredViewNames: ViewName[] | string[]) => string)
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

const Calendar = <TEvent extends object = CalendarEvent, TResource extends Resource = Resource>({
  components,
  localizer,
  messages,
  ...props
}: CalendarProps<TEvent, TResource>) => {
  const controlledProps = useUncontrolled(props, {
    view: 'onView',
    date: 'onNavigate',
    selected: 'onSelectEvent',
  })

  const {
    date,
    events = [],
    backgroundEvents = [],
    elementProps = {},
    toolbar = true,
    view = viewStrings.MONTH,
    views = Object.values(viewStrings),
    length = 30,
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
    className,
    rtl,
    style,
    onRangeChange,
    onNavigate,
    onSelectEvent,
    onDoubleClickEvent,
    onKeyPressEvent,
    onSelectSlot,
    onShowMore,
    onView,
    onDrillDown,
    showMultiDayTimes,
    formats,
    culture,
    eventPropGetter,
    slotPropGetter,
    slotGroupPropGetter,
    dayPropGetter,
    resourceGroupingLayout,
    resources = [],
    // popup = false,
    // step = 30,
    // allDayMaxRows = Infinity,
    // longPressThreshold = 250,
    // dayLayoutAlgorithm = 'overlap',
    // onSelecting,
    // min,
    // max,
    // scrollToTime,
    // enableAutoScroll,
    // showAllEvents,
    // selectable,
  } = controlledProps

  const getNow = props.getNow ?? (() => new Date())
  const localLocalizer = mergeWithDefaults(localizer, culture, formats, messages)

  const viewNames = useMemo(() => {
    if(Array.isArray(views)) return views

    const viewsFromObject = []
    for(const [key, value] of Object.entries(views)) {
      if(value) {
        viewsFromObject.push(key)
      }
    }

    return viewsFromObject
  }, [views])

  const isValidView = useCallback(
    (view: ViewName) => viewNames.indexOf(view) !== -1,
    [viewNames]
  )

  const viewComponents = useMemo(() => {
    if(Array.isArray(views)) {
      return transform(
        views,
        (obj, name) => obj[name] = VIEWS[name],
        {} as Record<ViewName, ViewComponent>
      )
    }

    if(typeof views === 'object') {
      return transform(views, (obj, value, key) => {
        if(value === false) return

        if(value === true) {
          obj[key] = VIEWS[key as ViewName]
        } else {
          obj[key as string] = value
        }
      }, {} as Record<ViewName, ViewComponent> & Record<string, ViewComponent>)
      // return mapValues(views, (value, key) => {
      //   if(value === true) {
      //     return VIEWS[key as ViewName]
      //   }

      //   return value
      // })
    }

    return VIEWS
  }, [views])

  // TODO: Revert to using accessor methods
  const accessors: Accessors<TEvent> = useMemo(() => {
    return {
      start: typeof startAccessor === 'function'
        ? startAccessor
        : (event: TEvent) => event[startAccessor as keyof TEvent] as Date,
      end: typeof endAccessor === 'function'
        ? endAccessor
        : (event: TEvent) => event[endAccessor as keyof TEvent] as Date,
      allDay: typeof allDayAccessor === 'function'
        ? allDayAccessor
        : (event: TEvent) => event[allDayAccessor as keyof TEvent] as boolean,
      tooltip: typeof tooltipAccessor === 'function'
        ? tooltipAccessor
        : (event: TEvent) => event[tooltipAccessor as keyof TEvent] as string,
      title: typeof titleAccessor === 'function'
        ? titleAccessor
        : (event: TEvent) => event[titleAccessor as keyof TEvent] as string,
      resource: typeof resourceAccessor === 'function'
        ? resourceAccessor
        : (event: TEvent) => event[resourceAccessor as keyof TEvent] as TResource,
      resourceId: typeof resourceIdAccessor === 'function'
        ? resourceIdAccessor
        : (resource: TResource) => resource[resourceIdAccessor as keyof TResource] as string | number,
      resourceTitle: typeof resourceTitleAccessor === 'function'
        ? resourceTitleAccessor
        : (resource: TResource) => resource[resourceTitleAccessor as keyof TResource] as string,
      eventId: typeof eventIdAccessor === 'function'
        ? eventIdAccessor
        : (event: TEvent) => event[eventIdAccessor as keyof TEvent] as string | number,
    }
  }, [allDayAccessor, endAccessor, eventIdAccessor, resourceAccessor, resourceIdAccessor, resourceTitleAccessor, startAccessor, titleAccessor, tooltipAccessor])

  const localComponents = useMemo(() => {
    return initComponents(components, view, viewNames)
  }, [components, view, viewNames])

  const getters: Getters<TEvent> = useMemo(() => {
    return {
      eventProp: (...args: Parameters<EventPropGetter<TEvent>>) =>
        (eventPropGetter && eventPropGetter(...args)) || {},
      // TODO: Is this used? because it's not defined or a prop
      // backgroundEventProp: (...args: Parameters<EventPropGetter<TEvent>>) =>
      //   (backgroundEventPropGetter && backgroundEventPropGetter(...args)) || {},
      slotProp: (...args: Parameters<SlotPropGetter>) =>
        (slotPropGetter && slotPropGetter(...args)) || {},
      slotGroupProp: (...args: Parameters<SlotGroupPropGetter>) =>
        (slotGroupPropGetter && slotGroupPropGetter(...args)) || {},
      dayProp: (...args: Parameters<DayPropGetter>) =>
        (dayPropGetter && dayPropGetter(...args)) || {},
    }
  }, [dayPropGetter, eventPropGetter, slotGroupPropGetter, slotPropGetter])

  const ViewComponent: ViewComponent = viewComponents[view]

  const ToolbarComponent = components?.toolbar || Toolbar

  /**
   *
   * @param date
   * @param viewComponent
   * @param {'month'|'week'|'work_week'|'day'|'agenda'} [view] - optional
   * parameter. It appears when range change on view changing. It could be handy
   * when you need to have both: range and view type at once, i.e. for manage rbc
   * state via url
   */
  const handleRangeChange = (date: Date, viewComponent: ViewComponent, view?: ViewName) => {
    if(!viewComponent.range) {
      // if(process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('onRangeChange prop not supported for this view')
      // }
      return
    }

    onRangeChange?.(viewComponent.range(date, { localizer: localLocalizer }), view)
  }

  const handleNavigate = (action: NavigateAction, newDate: Date) => {
    let today = getNow()

    const movedDate = moveDate(ViewComponent, {
      localizer,
      action,
      date: coerceDate(newDate || date || today),
      today,
      // ...controlledProps, # Removed props drilldown to static view methods
    })

    onNavigate?.(movedDate, view, action)
    handleRangeChange(movedDate, ViewComponent)
  }

  const handleViewChange = (newView: ViewName) => {
    if(view !== newView && isValidView(newView)) {
      onView?.(newView)
    }

    handleRangeChange(
      coerceDate(date || getNow()),
      viewComponents[newView],
      view
    )
  }

  const handleSelectEvent = (event: TEvent, e: React.SyntheticEvent<HTMLElement>) => {
    onSelectEvent?.(event, e)
  }

  const handleDoubleClickEvent = (event: TEvent, e: React.SyntheticEvent<HTMLElement>) => {
    onDoubleClickEvent?.(event, e)
  }

  const handleKeyPressEvent = (event: TEvent, e: React.SyntheticEvent<HTMLElement>) => {
    onKeyPressEvent?.(event, e)
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    onSelectSlot?.(slotInfo)
  }

  const handleDrillDown = (date: Date, view: ViewName) => {
    if(onDrillDown) {
      onDrillDown(date, view, drilldownView)
      return
    }

    if(view) handleViewChange(view)

    handleNavigate(navigate.DATE, date)
  }

  const handleGetDrilldownView = (date: Date, currentViewName: ViewName, configuredViewNames: ViewName[]) => {
    if(!getDrilldownView) return drilldownView

    return getDrilldownView(date, view, Object.keys(viewComponents))
  }

  const current = coerceDate(date || getNow())

  return (
    <CalendarProvider value={ {
      localizer: localLocalizer,
      components: localComponents,
      accessors,
      getters,
      rtl,
      date: current,
      getNow,
    } }>
      <div
        { ...elementProps }
        className={ clsx(className, 'rbc-calendar', rtl && 'rbc-rtl') }
        style={ style }
      >
        { toolbar && (
          <ToolbarComponent
            view={ view }
            views={ viewNames }
            label={ ViewComponent.title(current, { localizer: localLocalizer, length }) }
            onView={ handleViewChange }
            onNavigate={ handleNavigate }
          />
        ) }
        <ViewComponent
          events={ events }
          backgroundEvents={ backgroundEvents }
          showMultiDayTimes={ showMultiDayTimes }
          getDrilldownView={ handleGetDrilldownView }
          onNavigate={ handleNavigate }
          onDrillDown={ handleDrillDown }
          onSelectEvent={ handleSelectEvent }
          onDoubleClickEvent={ handleDoubleClickEvent }
          onKeyPressEvent={ handleKeyPressEvent }
          onSelectSlot={ handleSelectSlot }
          resources={ resources }

          // props for Month view
          onShowMore={ onShowMore }
          doShowMoreDrillDown={ doShowMoreDrillDown }
          resourceGroupingLayout={ resourceGroupingLayout }

          // props for Agenda view
          length={ length }

          // { ...controlledProps }
        />
      </div>
    </CalendarProvider>
  )
}

export default Calendar
