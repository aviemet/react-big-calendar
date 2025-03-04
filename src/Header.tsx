export interface HeaderProps {
  label: string
}

const Header = ({ label }: HeaderProps) => {
  return (
    <span role="columnheader" aria-sort="none">
      { label }
    </span>
  )
}

export default Header
