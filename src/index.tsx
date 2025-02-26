import EventWrapper from './EventWrapper'
import BackgroundWrapper from './BackgroundWrapper'

export const components = {
  eventWrapper: EventWrapper,
  timeSlotWrapper: BackgroundWrapper,
  dateCellWrapper: BackgroundWrapper,
}

export { default as Calendar } from './components/Calendar'
export {
  DateLocalizer,
  momentLocalizer,
  luxonLocalizer,
  globalizeLocalizer,
  dateFnsLocalizer,
  dayjsLocalizer,
} from './localizers'
export { default as move } from './utils/move'
export { views as Views,
  navigate as Navigate } from './utils/constants'
