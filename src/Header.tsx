import { DateLocalizer } from './localizers'

export interface HeaderProps {
  date: Date
  label: string
  localizer: DateLocalizer
}

const Header = ({ label }: HeaderProps) => {
  return (
    <span role="columnheader" aria-sort="none">
      { label }
    </span>
  )
}

export default Header
