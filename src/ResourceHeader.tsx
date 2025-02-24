import PropTypes from 'prop-types'
import React from 'react'

export interface ResourceHeaderProps<TResource extends object = object> {
  label: React.ReactNode;
  index: number;
  resource: TResource;
}

const ResourceHeader = ({ label }) => {
  return <React.Fragment>{label}</React.Fragment>
}

ResourceHeader.propTypes = {
  label: PropTypes.node,
  index: PropTypes.number,
  resource: PropTypes.object,
}

export default ResourceHeader
