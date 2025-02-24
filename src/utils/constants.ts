export let navigate = {
  PREVIOUS: 'PREV',
  NEXT: 'NEXT',
  TODAY: 'TODAY',
  DATE: 'DATE',
} as const

export type NavigateKey = keyof typeof navigate;
export type NavigateAction = typeof navigate[NavigateKey];

export let views = {
  MONTH: 'month',
  WEEK: 'week',
  WORK_WEEK: 'work_week',
  DAY: 'day',
  AGENDA: 'agenda',
} as const

export type ViewKey = keyof typeof views;
export type View = typeof views[ViewKey];