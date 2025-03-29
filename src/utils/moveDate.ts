import { VIEW_COMPONENTS, ViewStaticMethodProps, type ViewComponent } from "@/Views"

import { CalendarEvent } from "./components"
import { invariant } from "./invariant"
import { Resource } from "./Resources"

export let navigate = {
  PREVIOUS: "PREV",
  NEXT: "NEXT",
  TODAY: "TODAY",
  DATE: "DATE",
} as const

export type NavigateKey = keyof typeof navigate
export type NavigateAction = typeof navigate[NavigateKey]

export type MoveDateOptions<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> = ViewStaticMethodProps<TEvent, TResource> & {
  action: NavigateAction
}

export const moveDate = <TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>(
  View: ViewComponent,
  { action, date, today, ...props }: MoveDateOptions<TEvent, TResource>
) => {
  View = typeof View === "string" ? VIEW_COMPONENTS[View] : View

  switch(action) {
    case navigate.TODAY:
      date = today || new Date()
      break
    case navigate.DATE:
      break
    default:
      invariant(
        View && typeof View.navigate === "function",
        "Calendar View components must implement a static `.navigate(date, action)` method.s"
      )
      date = View.navigate(date, action, props)
  }
  return date
}
