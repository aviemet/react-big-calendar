export interface Messages<TEvent extends object = Event> {
  date?: React.ReactNode | undefined;
  time?: React.ReactNode | undefined;
  event?: React.ReactNode | undefined;
  allDay?: React.ReactNode | undefined;
  week?: React.ReactNode | undefined;
  work_week?: React.ReactNode | undefined;
  day?: React.ReactNode | undefined;
  month?: React.ReactNode | undefined;
  previous?: React.ReactNode | undefined;
  next?: React.ReactNode | undefined;
  yesterday?: React.ReactNode | undefined;
  tomorrow?: React.ReactNode | undefined;
  today?: React.ReactNode | undefined;
  agenda?: React.ReactNode | undefined;
  showMore?: ((count: number, remainingEvents: TEvent[], events: TEvent[]) => React.ReactNode) | undefined;
  noEventsInRange?: React.ReactNode | undefined;
}

let defaultMessages: Messages = {
  date: 'Date',
  time: 'Time',
  event: 'Event',
  allDay: 'All Day',
  week: 'Week',
  work_week: 'Work Week',
  day: 'Day',
  month: 'Month',
  previous: 'Back',
  next: 'Next',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  today: 'Today',
  agenda: 'Agenda',

  noEventsInRange: 'There are no events in this range.',

  showMore: (total) => `+${total} more`,
}

export default function messages(msgs) {
  return {
    ...defaultMessages,
    ...msgs,
  }
}
