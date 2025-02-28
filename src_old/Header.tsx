
import React from 'react'

const Header = ({ label }) => {
  return (
    <span role="columnheader" aria-sort="none">
      { label }
    </span>
  )
}

Header.propTypes = {
  label: PropTypes.node,
}

export default Header
