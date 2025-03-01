export let navigate = {
  PREVIOUS: 'PREV',
  NEXT: 'NEXT',
  TODAY: 'TODAY',
  DATE: 'DATE',
} as const

export type NavigateKey = keyof typeof navigate
export type NavigateAction = typeof navigate[NavigateKey]
