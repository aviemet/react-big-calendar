export type DayLayoutFunction<TEvent extends object = Event> = (_: {
  events: TEvent[]
  minimumStartDifference: number
  slotMetrics: any
  accessors: any
}) => Array<{ event: TEvent, style: React.CSSProperties }>;

export type DayLayoutAlgorithm = "overlap" | "no-overlap";
