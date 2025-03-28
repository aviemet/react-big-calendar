import { useReducer } from "react"

import { CalendarEvent } from "@/utils/components"

export interface MonthViewState<TEvent extends CalendarEvent = CalendarEvent> {
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

export type MonthViewAction<TEvent extends CalendarEvent = CalendarEvent> =
  | { type: "SET_MEASURE_LIMIT", needLimitMeasure: boolean }
  | { type: "SET_DATE", date: Date }
  | { type: "SET_OVERLAY", overlay: MonthViewState<TEvent>["overlay"] }
  | { type: "RESET_MEASURE", rowLimit: number }
  | { type: "HIDE_OVERLAY" }

function monthViewReducer<TEvent extends CalendarEvent = CalendarEvent>(
  state: MonthViewState<TEvent>,
  action: MonthViewAction<TEvent>
): MonthViewState<TEvent> {
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
        rowLimit: action.rowLimit,
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

export const useMonthViewState = <TEvent extends CalendarEvent = CalendarEvent>(date?: Date) => {
  const [state, dispatch] = useReducer(monthViewReducer<TEvent>, {
    date: date || new Date(),
    rowLimit: 5,
    needLimitMeasure: true,
    overlay: null,
  })

  return [state, dispatch] as const
}
