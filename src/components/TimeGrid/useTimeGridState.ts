import { CalendarEvent } from "@/utils/components"
import { BaseViewCallbacks } from "@/Views"
import { useReducer } from "react"

export interface TimeGridState<TEvent extends CalendarEvent = CalendarEvent> {
  callbacks: BaseViewCallbacks<TEvent>
}

export type TimeGridAction<TEvent extends CalendarEvent = CalendarEvent> =
| { type: "REGISTER_CALLBACKS", callbacks: BaseViewCallbacks<TEvent> }

function timeGridReducer<TEvent extends CalendarEvent = CalendarEvent>(
  state: TimeGridState<TEvent>,
  action: TimeGridAction<TEvent>
): TimeGridState<TEvent> {
  switch(action.type) {
    case "REGISTER_CALLBACKS":
      return {
        ...state,
        callbacks: action.callbacks,
      }
    default:
      return state
  }
}

export const useTimeGridState = <TEvent extends CalendarEvent = CalendarEvent>({
  callbacks = {},
}: Partial<TimeGridState<TEvent>> = {}) => {
  const [state, dispatch] = useReducer(timeGridReducer<TEvent>, {
    callbacks,
  })

  return [state, dispatch] as const
}
