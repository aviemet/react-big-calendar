import { CalendarEvent } from "@/types"
import { Resource } from "./Resources"

export type Accessors<TEvent extends object = CalendarEvent, TResource extends object = object> = {
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

type AccessorInput = CalendarEvent | Resource
type AccessorFunction<T extends AccessorInput = AccessorInput> = (data: T) => unknown

/**
 * Retrieve via an accessor-like property
 *
 *    accessor(obj, 'name')   // => retrieves obj['name']
 *    accessor(data, func)    // => retrieves func(data)
 *    ... otherwise null
 */
function accessor<T extends AccessorInput>(
  data: T,
  field: keyof T | AccessorFunction<T>
): unknown {
  let value = null

  if(typeof field === 'function') {
    value = (field as AccessorFunction<T>)(data)
  } else if(
    typeof field === 'string' &&
    typeof data === 'object' &&
    data !== null &&
    field in data
  ) {
    value = data[field as keyof T]
  }

  return value
}

type AccessorKey<T extends AccessorInput> = keyof T | AccessorFunction<T>

export const wrapAccessor = <T extends AccessorInput>(acc: AccessorKey<T>) =>
  (data: T) => accessor(data, acc)

export const wrapAccessors = <TEvent extends object = CalendarEvent, TResource extends object = object>(
  accessors: Partial<Record<keyof Accessors<TEvent, TResource>, AccessorKey<TEvent>>>
): Partial<Record<keyof Accessors<TEvent, TResource>, AccessorFunction<TEvent>>> => {
  return Object.keys(accessors).reduce((acc, key) => {
    acc[key as keyof Accessors<TEvent, TResource>] = wrapAccessor(accessors[key as keyof Accessors<TEvent, TResource>])
    return acc
  }, {} as Partial<Record<keyof Accessors<TEvent, TResource>, AccessorFunction<TEvent>>>)
}
