import { NoopWrapper } from "./components/NoopWrapper"

export const components = {
  eventWrapper: NoopWrapper,
  timeslotWrapper: NoopWrapper,
  dateCellWrapper: NoopWrapper,
}

export { Calendar, useCalendarContext } from "./components/Calendar"

export {
  DateLocalizer,
  momentLocalizer,
  luxonLocalizer,
  globalizeLocalizer,
  dateFnsLocalizer,
  dayjsLocalizer,
} from "./localizers"

export { moveDate as move } from "./utils/moveDate"

export {
  navigate as Navigate,
} from "./utils/moveDate"

export { views as Views } from "./Views"
