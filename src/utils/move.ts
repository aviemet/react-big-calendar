import invariant from "invariant"
import { VIEW_COMPONENTS, type ViewComponent } from "@/Views"
import { DateLocalizer } from "@/localizers"

export let navigate = {
  PREVIOUS: "PREV",
  NEXT: "NEXT",
  TODAY: "TODAY",
  DATE: "DATE",
} as const

export type NavigateKey = keyof typeof navigate
export type NavigateAction = typeof navigate[NavigateKey]

export type MoveDateOptions = {
  action: NavigateAction
  date: Date
  today: Date
  localizer: DateLocalizer
} // & CalendarProps

// TODO: Removed extra props passthrough because it was making the types difficult
// need to assess if passing props to the ViewComponent static methods is required

export const moveDate = (
  View: ViewComponent,
  { action, date, today, ...props }: MoveDateOptions
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
