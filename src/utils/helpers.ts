var idCount = 0

function uniqueId(prefix?: string) {
  return `${prefix ?? ""}${++idCount}`
}

export function instanceId(component, suffix = "") {
  component.__id || (component.__id = uniqueId("rw_"))
  return (component.props.id || component.__id) + suffix
}

export function isFirstFocusedRender(component) {
  return (
    component._firstFocus ||
    (component.state.focused && (component._firstFocus = true))
  )
}

export function coerceDate(date: string | Date) {
  if(typeof date === "string") {
    return new Date(date)
  }
  return date
}

export function stringifyPercent(v: number | string) {
  return typeof v === "string" ? v : v + "%"
}
