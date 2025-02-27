/**
 * Retrieve via an accessor-like property
 *
 *    accessor(obj, 'name')   // => retrieves obj['name']
 *    accessor(data, func)    // => retrieves func(data)
 *    ... otherwise null
 */
export function accessor(data: Record<string, unknown>, field: string | ((data: Record<string, unknown>) => unknown)) {
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

export const wrapAccessor = (
  acc: string | ((data: Record<string, unknown>) => unknown)
) => (data: Record<string, unknown>) => accessor(data, acc)
