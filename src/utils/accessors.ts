import { CalendarEvent } from "@/types"
import { Resource } from "./Resources"

export type Accessors<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> = {
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
export function accessor<T extends AccessorInput>(
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

export const wrapEventAccessor = <TEvent extends CalendarEvent = CalendarEvent, K extends keyof TEvent | string = string>(
  acc: K | ((event: TEvent) => any)
) => (data: TEvent) => accessor(data, acc as keyof TEvent | ((event: TEvent) => any))

export const wrapResourceAccessor = <TResource extends Resource = Resource, K extends keyof TResource | string = string>(
  acc: K | ((resource: TResource) => any)
) => (data: TResource) => accessor(data, acc as keyof TResource | ((resource: TResource) => any))
