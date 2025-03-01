import CalendarEvent from "./layout-algorithms/CalendarEvent"
import { Resource } from "./Resources"

type Accessor = string | Function

export type Accessors<TEvent extends object = Event, TResource extends object = object> = {
  title?: ((event: TEvent) => string) | undefined
  tooltip?: ((event: TEvent) => string) | undefined
  end?: ((event: TEvent) => Date) | undefined
  start?: ((event: TEvent) => Date) | undefined
  allDay?: ((event: TEvent) => boolean) | undefined
  resource?: ((event: TEvent) => TResource) | undefined
  resourceId?: ((resource: TResource) => string | number) | undefined
  resourceTitle?: ((resource: TResource) => string) | undefined
  eventId?: ((event: TEvent) => string | number) | undefined
}

/**
 * Retrieve via an accessor-like property
 *
 *    accessor(obj, 'name')   // => retrieves obj['name']
 *    accessor(data, func)    // => retrieves func(data)
 *    ... otherwise null
 */
function accessor(data: Event | Resource, field: string | ((data: Event | Resource) => Accessors)) {
  let value = null

  if(typeof field === 'function') value = field(data)
  else if(
    typeof field === 'string' &&
    typeof data === 'object' &&
    data !== null &&
    field in data
  )
    value = data[field]

  return value
}

export const wrapAccessor = (acc: string | Function) => (data: Event | Resource) => accessor(data, acc)

export const wrapAccessors = (accessors: Record<keyof Accessors, string | Function>) => {
  return Object.keys(accessors).reduce((acc, key: keyof Accessors) => {
    acc[key] = wrapAccessor(accessors[key])
    return acc
  }, {} as Record<keyof Accessors, string | Function>)
}
