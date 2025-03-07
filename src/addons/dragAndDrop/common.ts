import { DateLocalizer } from "@/localizers"
import { Accessors, wrapAccessor } from "@/utils/accessors"
import { CalendarEvent } from "@/utils/components"
import { ComponentClass, createElement, FunctionComponent } from "react"

function createFactory(type: string | FunctionComponent<{}> | ComponentClass<{}, any>) {
  return createElement(type).bind(null, type)
}

export const dragAccessors = {
  start: wrapAccessor((e) => e.start),
  end: wrapAccessor((e) => e.end),
}

function nest(...Components: React.ReactNode[]) {
  const factories = Components.filter(Boolean).map(createFactory)
  const Nest = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) =>
    factories.reduceRight((child, factory) => factory(props, child), children)

  return Nest
}

export function mergeComponents(components = {}, addons) {
  const keys = Object.keys(addons)
  const result = { ...components }

  keys.forEach((key) => {
    result[key] = components[key]
      ? nest(components[key], addons[key])
      : addons[key]
  })
  return result
}

export function pointInColumn(bounds, point) {
  const { left, right, top } = bounds
  const { x, y } = point
  return x < right + 10 && x > left && y > top
}

export function eventTimes(event: CalendarEvent, accessors: Accessors, localizer: DateLocalizer) {
  let start = accessors.start(event)
  let end = accessors.end(event)

  const isZeroDuration =
    localizer.eq(start, end, "minutes") &&
    localizer.diff(start, end, "minutes") === 0
  // make zero duration midnight events at least one day long
  if(isZeroDuration) end = localizer.add(end, 1, "day")
  const duration = localizer.diff(start, end, "milliseconds")
  return { start, end, duration }
}
