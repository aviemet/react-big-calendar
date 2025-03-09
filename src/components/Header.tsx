import { ViewHeaderProps } from "."

const Header = ({ label }: ViewHeaderProps) => {
  return (
    <span role="columnheader" aria-sort="none">
      { label }
    </span>
  )
}

export { Header }
