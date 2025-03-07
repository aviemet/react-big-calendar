import { CalendarEvent } from "@/utils/components"
import { useReducer } from "react"

interface MonthViewState<TEvent extends CalendarEvent = CalendarEvent> {
  rowLimit: number
  needLimitMeasure: boolean
  date?: Date
  overlay: {
    date: Date
    events: TEvent[]
    position: { x: number, y: number }
    end: Date
    target: HTMLElement
  } | null
}

type MonthViewAction =
  | { type: "SET_MEASURE_LIMIT", needLimitMeasure: boolean }
  | { type: "SET_DATE", date: Date }
  | { type: "SET_OVERLAY", overlay: MonthViewState["overlay"] }
  | { type: "RESET_MEASURE" }
  | { type: "HIDE_OVERLAY" }

function monthViewReducer(state: MonthViewState, action: MonthViewAction): MonthViewState {
  switch(action.type) {
    case "SET_MEASURE_LIMIT":
      return {
        ...state,
        needLimitMeasure: action.needLimitMeasure,
      }
    case "SET_DATE":
      return {
        ...state,
        date: action.date,
      }
    case "SET_OVERLAY":
      return {
        ...state,
        overlay: action.overlay,
      }
    case "RESET_MEASURE":
      return {
        ...state,
        needLimitMeasure: false,
        rowLimit: 5,
      }
    case "HIDE_OVERLAY":
      return {
        ...state,
        overlay: null,
      }
    default:
      return state
  }
}

export const useMonthViewState = (date: Date) => {
  const [state, dispatch] = useReducer(monthViewReducer, {
    date,
    rowLimit: 5,
    needLimitMeasure: true,
    overlay: null,
  })

  return [state, dispatch] as const
}
