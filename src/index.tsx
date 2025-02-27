import NoopWrapper from './NoopWrapper'

export const components = {
  eventWrapper: NoopWrapper,
  timeslotWrapper: NoopWrapper,
  dateCellWrapper: NoopWrapper,
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

export {
  views as Views,
  navigate as Navigate,
} from './utils/constants'
