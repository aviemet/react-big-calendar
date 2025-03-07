import React from "react"

export interface ResourceHeaderProps<TResource extends object = object> {
  label: React.ReactNode
  index: number
  resource: TResource
}

const ResourceHeader = ({ label, ...props }: ResourceHeaderProps) => {
  return <>{ label }</>
}

export default ResourceHeader
