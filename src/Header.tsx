import PropTypes from 'prop-types'
import React from 'react'
import { DateLocalizer } from './localizers';

export interface HeaderProps {
  date: Date;
  label: string;
  localizer: DateLocalizer;
}

const Header = ({ label }) => {
  return (
    <span role="columnheader" aria-sort="none">
      {label}
    </span>
  )
}

Header.propTypes = {
  label: PropTypes.node,
}

export default Header
