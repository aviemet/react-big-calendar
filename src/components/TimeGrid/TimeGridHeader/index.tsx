import clsx from "clsx"
import scrollbarSize from "dom-helpers/scrollbarSize"

import { useCalendarContext } from "@/Calendar"
import { CalendarEvent } from "@/utils/components"
import { Resource, ResourceManager } from "@/utils/Resources"

import { DatesHeader } from "./DatesHeader"
import { ResourcesHeader } from "./ResourcesHeader"


export interface TimeGridHeaderProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> {
  range: Date[]
  events: TEvent[]
  resources: ReturnType<typeof ResourceManager<TEvent, TResource>>
  resourceGroupingLayout?: boolean
  isOverflowing: boolean
  resizable: boolean
  width: number
  selected: TEvent
  selectable: boolean | "ignoreEvents"
  longPressThreshold: number
  allDayMaxRows: number
  onSelectSlot: (slot: Date[]) => void
  onSelectEvent: (event: TEvent) => void
  onDoubleClickEvent: (event: TEvent) => void
  onKeyPressEvent: (event: TEvent) => void
  onDrillDown: (date: Date, view: string) => void
  onShowMore: (events: TEvent[], date: Date, cell: HTMLElement, slot: HTMLElement, target: HTMLElement) => void
  getDrilldownView: (date: Date) => string
  scrollRef: React.RefObject<HTMLDivElement>
}

const TimeGridHeader = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>(props: TimeGridHeaderProps<TEvent, TResource>) => {
  const {
    width,
    resources,
    resourceGroupingLayout,
    range,
    events,
    selectable,
    scrollRef,
    isOverflowing,
    resizable,
    allDayMaxRows,
    onSelectSlot,
    onSelectEvent,
    onDoubleClickEvent,
    onKeyPressEvent,
    onDrillDown,
    onShowMore,
    getDrilldownView,
    longPressThreshold,
    selected,
  } = props

  const { rtl, components: {
    timeGutterHeader: TimeGutterHeader,
  } } = useCalendarContext()

  const style = isOverflowing
    ? { [rtl ? "marginLeft" : "marginRight"]: `${scrollbarSize() - 1}px` }
    : {}

  return (
    <div
      style={ style }
      ref={ scrollRef }
      className={ clsx("rbc-time-header", { "rbc-overflowing": isOverflowing }) }
    >
      <div
        className={ clsx("rbc-label", "rbc-time-header-gutter") }
        style={ { width, minWidth: width, maxWidth: width } }
      >
        <TimeGutterHeader />
      </div>

      {
        resourceGroupingLayout
          ? <ResourcesHeader { ...props } />
          : <DatesHeader { ...props } />
      }

    </div>
  )
}

export { TimeGridHeader }
