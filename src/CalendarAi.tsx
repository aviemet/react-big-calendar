import clsx from 'clsx'
import React, { useCallback, useMemo } from 'react'
import { uncontrollable } from 'uncontrollable'

import { mergeWithDefaults } from './localizers'
import NoopWrapper from './NoopWrapper'
import Toolbar, { ToolbarProps } from './Toolbar'
import { navigate, views, NavigateAction, View } from './utils/constants'
import { notify } from './utils/helpers'
import { buildMessages } from './utils/messages'
import moveDate from './utils/move'
import VIEWS, { ViewComponent, BaseViewProps, ViewStatic, TitleOptions } from './Views'

import defaults from 'lodash/defaults'
import mapValues from 'lodash/mapValues'
import omit from 'lodash/omit'
import transform from 'lodash/transform'
import { wrapAccessor } from './utils/accessors'
import { DateLocalizer } from './localizers'
import { CalendarProps } from './components/Calendar'
import { Components, Getters, Accessors, SlotInfo } from './types'

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

function getContext<TEvent extends object = Event, TResource extends object = object>({
  startAccessor,
  endAccessor,
  allDayAccessor,
  tooltipAccessor,
  titleAccessor,
  resourceAccessor,
  resourceIdAccessor,
  resourceTitleAccessor,
  eventIdAccessor,
  eventPropGetter,
  slotPropGetter,
  slotGroupPropGetter,
  dayPropGetter,
  view,
  views: viewsProp,
  localizer,
  culture,
  messages = {},
  components = {},
  formats = {},
}: CalendarProps<TEvent, TResource>): CalendarState<TEvent, TResource>['context'] {
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
      start: (event: TEvent) => {
        if(typeof startAccessor === 'function') return startAccessor(event)
        return event[startAccessor as keyof TEvent] as Date
      },
      end: (event: TEvent) => {
        if(typeof endAccessor === 'function') return endAccessor(event)
        return event[endAccessor as keyof TEvent] as Date
      },
      allDay: (event: TEvent) => {
        if(typeof allDayAccessor === 'function') return allDayAccessor(event)
        return event[allDayAccessor as keyof TEvent] as boolean
      },
      tooltip: (event: TEvent) => {
        if(typeof tooltipAccessor === 'function') return tooltipAccessor(event)
        return event[tooltipAccessor as keyof TEvent] as string
      },
      title: (event: TEvent) => {
        if(typeof titleAccessor === 'function') return titleAccessor(event)
        return event[titleAccessor as keyof TEvent] as string
      },
      resource: (event: TEvent) => {
        if(typeof resourceAccessor === 'function') return resourceAccessor(event)
        return event[resourceAccessor as keyof TEvent] as TResource
      },
      resourceId: (resource: TResource) => {
        if(typeof resourceIdAccessor === 'function') return resourceIdAccessor(resource)
        return resource[resourceIdAccessor as keyof TResource] as string | number
      },
      resourceTitle: (resource: TResource) => {
        if(typeof resourceTitleAccessor === 'function') return resourceTitleAccessor(resource)
        return resource[resourceTitleAccessor as keyof TResource] as string
      },
      eventId: (event: TEvent) => {
        if(typeof eventIdAccessor === 'function') return eventIdAccessor(event)
        return event[eventIdAccessor as keyof TEvent] as string | number
      },
    },
  }
}

function Calendar<TEvent extends object = Event, TResource extends object = object>({
  view = views.MONTH,
  toolbar = true,
  events = [],
  backgroundEvents = [],
  resourceGroupingLayout,
  style,
  className,
  elementProps = {},
  date: current,
  getNow = () => new Date(),
  length = 30,
  showMultiDayTimes,
  onShowMore,
  doShowMoreDrillDown = true,
  components: _0,
  formats: _1,
  messages: _2,
  culture: _3,
  drilldownView = views.DAY,
  getDrilldownView: getDrilldownViewProp,
  onNavigate,
  onView,
  onDrillDown,
  onRangeChange,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onSelectSlot,
  ...props
}: CalendarProps<TEvent, TResource>) {

  const context = useMemo(() => getContext({
    view,
    events,
    backgroundEvents,
    date: current,
    getNow,
    length,
    ...props,
  }), [view, events, backgroundEvents, current, getNow, length, props])

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

  const getDrilldownView = useCallback((date: Date) => {
    if(!getDrilldownViewProp) return drilldownView
    const viewKeys = Object.keys(getViews()) as View[]
    const result = getDrilldownViewProp(date, view, viewKeys)
    return result || drilldownView
  }, [getDrilldownViewProp, drilldownView, view, getViews])

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
  const { accessors, components, getters, localizer, viewNames } = context

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
  } as unknown as CalendarProps<Event>)

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
        events={ events as Event[] }
        backgroundEvents={ backgroundEvents as Event[] }
        date={ currentDate }
        getNow={ getNow }
        length={ length }
        localizer={ localizer }
        getters={ getters }
        components={ components }
        accessors={ accessors }
        showMultiDayTimes={ showMultiDayTimes }
        getDrilldownView={ getDrilldownView }
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
