import React from 'react'
import { useCalendarContext } from './Calendar'
import { navigate, NavigateAction } from './utils/constants'
import { ViewName, ViewsProps } from './Views'
import clsx from 'clsx'

export interface ToolbarProps {
  date: Date
  view: ViewName
  views: ViewsProps
  label: string
  onNavigate: (navigate: NavigateAction, date?: Date) => void
  onView: (view: ViewName) => void
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
        { Array.isArray(views) && views.map(name => {
          return (
            <button
              key={ name }
              onClick={ () => onView(name) }
              className={ clsx({ "rbc-active": view === name }) }
            >
              { localizer.messages[name] }
            </button>
          )
        }) }
      </span>
    </div>
  )
}


export default Toolbar
