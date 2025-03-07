import NoopWrapper from "./NoopWrapper"

export const components = {
  eventWrapper: NoopWrapper,
  timeslotWrapper: NoopWrapper,
  dateCellWrapper: NoopWrapper,
}

export { default as Calendar, useCalendarContext } from "./Calendar"

export {
  DateLocalizer,
  momentLocalizer,
  luxonLocalizer,
  globalizeLocalizer,
  dateFnsLocalizer,
  dayjsLocalizer,
} from "./localizers"

export { default as move } from "./utils/move"

export {
  navigate as Navigate,
} from "./utils/move"

export { views as Views } from "./Views"
