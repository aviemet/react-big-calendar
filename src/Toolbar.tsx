import React from 'react'
import { navigate, NavigateAction, View } from './utils/constants'
import { ViewsProps } from './Views'
import { useCalendarContext } from './Calendar'
import clsx from 'clsx'

export interface ToolbarProps {
  date: Date
  view: View
  views: ViewsProps
  label: string
  onNavigate: (navigate: NavigateAction, date?: Date) => void
  onView: (view: View) => void
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
