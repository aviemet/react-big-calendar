import { NavigateAction, View, views } from './utils/constants'
import Month from './Month'
import Day from './Day'
import Week from './Week'
import WorkWeek from './WorkWeek'
import Agenda from './Agenda'
import { Culture, DateFormat } from './localizers/types'

export interface TitleOptions {
  formats: DateFormat[]
  culture?: Culture | undefined
  [propName: string]: any
}

export interface ViewStatic {
  navigate(date: Date, action: NavigateAction, props: any): Date
  title(date: Date, options: TitleOptions): string
}

export type ViewsProps<TEvent extends object = Event, TResource extends object = object> =
    | View[]
    | {
      work_week?: boolean | (React.ComponentType<any> & ViewStatic) | undefined
      day?: boolean | (React.ComponentType<any> & ViewStatic) | undefined
      agenda?: boolean | (React.ComponentType<any> & ViewStatic) | undefined
      month?: boolean | (React.ComponentType<any> & ViewStatic) | undefined
      week?: boolean | (React.ComponentType<any> & ViewStatic) | undefined
    };


interface BaseViewProps {
  date: Date
}

export type BaseViewComponent = React.ComponentType<BaseViewProps> & {
  range: (date: Date) => Date[]
  navigate: (date: Date, action: NavigateAction) => Date
  title: (date: Date) => string
}

const VIEW_COMPONENTS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
} as const

export default VIEW_COMPONENTS
