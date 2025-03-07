interface ScrollableWeekWrapperProps {
  children: React.ReactNode
}

const ScrollableWeekWrapper = ({ children }: ScrollableWeekWrapperProps) => {
  return <div className="rbc-row-content-scroll-container">{ children }</div>
}

export default ScrollableWeekWrapper
