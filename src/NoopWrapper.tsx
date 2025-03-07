import { PropsWithChildren } from "react"

function NoopWrapper({ children, ...props }: PropsWithChildren<any>) {
  return children
}

export default NoopWrapper
