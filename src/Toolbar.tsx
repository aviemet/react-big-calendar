import React from 'react'
import { useCalendarContext } from './Calendar'
import { navigate, NavigateAction } from './utils/move'
import { ViewName } from './Views'
import clsx from 'clsx'

export interface ToolbarProps {
  view: ViewName
  views: string[]
  label: string
  onNavigate: (navigate: NavigateAction, date?: Date) => void
  onView: (view: ViewName | string) => void
  children?: React.ReactNode | undefined
}

export const Toolbar = ({
  label,
  onNavigate,
  onView,
  view,
  views,
}: ToolbarProps) => {
  const { localizer } = useCalendarContext()

  return (
    <div className={ clsx("rbc-toolbar") }>
      <span className={ clsx("rbc-btn-group") }>
        <button onClick={ () => onNavigate(navigate.PREVIOUS) }>{ localizer.messages.previous }</button>
        <button onClick={ () => onNavigate(navigate.TODAY) }>{ localizer.messages.today }</button>
        <button onClick={ () => onNavigate(navigate.NEXT) }>{ localizer.messages.next }</button>
      </span>

      <span className={ clsx("rbc-toolbar-label") }>{ label }</span>

      <span className={ clsx("rbc-btn-group") }>
        { views.map(name => {
          const key = name as keyof typeof localizer.messages

          if(key in localizer.messages
            && typeof localizer.messages[key] !== "function") {

            return (
              <button
                key={ key }
                onClick={ () => onView(key) }
                className={ clsx({ "rbc-active": view === key }) }
              >
                { localizer.messages[key] }
              </button>
            )
          }

          return <></>
        }) }
      </span>
    </div>
  )
}


export default Toolbar
