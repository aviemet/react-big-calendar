import invariant from 'invariant'
import { navigate, NavigateAction } from './constants'
import VIEWS, { ViewStatic } from '../Views'
import { DateLocalizer } from '@/localizers'
import { CalendarProps } from '@/Calendar'

export type MoveDateOptions = {
  action: NavigateAction
  date: Date
  today: Date
  props: Partial<CalendarProps> & {
    localizer: DateLocalizer
  }
}

export default function moveDate(
  View: ViewStatic,
  { action, date, today, ...props }: MoveDateOptions
) {
  View = typeof View === 'string' ? VIEWS[View] : View

  switch(action) {
    case navigate.TODAY:
      date = today || new Date()
      break
    case navigate.DATE:
      break
    default:
      invariant(
        View && typeof View.navigate === 'function',
        'Calendar View components must implement a static `.navigate(date, action)` method.s'
      )
      date = View.navigate(date, action, props)
  }
  return date
}
