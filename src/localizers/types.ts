import { DateLocalizer } from "."

export interface DateRange {
  start: Date
  end: Date
}

export type Culture = string
export type FormatInput = number | string | Date | DateRange
export type DateFormatFunction = (date: Date, culture?: Culture, localizer?: DateLocalizer) => string
export type DateRangeFormatFunction = (range: DateRange, culture?: Culture, localizer?: DateLocalizer) => string
export type DateFormat = string | DateFormatFunction

export interface Formats {
  /**
	 * Format for the day of the month heading in the Month view.
	 * e.g. "01", "02", "03", etc
	 */
  dateFormat?: DateFormat | undefined

  /**
	 * A day of the week format for Week and Day headings,
	 * e.g. "Wed 01/04"
	 */
  dayFormat?: DateFormat | undefined

  /**
	 * Week day name format for the Month week day headings,
	 * e.g: "Sun", "Mon", "Tue", etc
	 */
  weekdayFormat?: DateFormat | undefined

  /**
	 * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
	 */
  timeGutterFormat?: DateFormat | undefined

  /**
	 * Toolbar header format for the Month view, e.g "2015 April"
	 */
  monthHeaderFormat?: DateFormat | undefined

  /**
	 * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
	 */
  dayRangeHeaderFormat?: DateRangeFormatFunction | undefined

  /**
	 * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
	 */
  dayHeaderFormat?: DateFormat | undefined

  /**
	 * Toolbar header format for the Agenda view, e.g. "4/1/2015 — 5/1/2015"
	 */
  agendaHeaderFormat?: DateRangeFormatFunction | undefined

  /**
	 * A time range format for selecting time slots, e.g "8:00am — 2:00pm"
	 */
  selectRangeFormat?: DateRangeFormatFunction | undefined

  agendaDateFormat?: DateFormat | undefined
  agendaTimeFormat?: DateFormat | undefined
  agendaTimeRangeFormat?: DateRangeFormatFunction | undefined

  /**
	 * Time range displayed on events.
	 */
  eventTimeRangeFormat?: DateRangeFormatFunction | undefined

  /**
	 * An optional event time range for events that continue onto another day
	 */
  eventTimeRangeStartFormat?: DateRangeFormatFunction | undefined

  /**
	 * An optional event time range for events that continue from another day
	 */
  eventTimeRangeEndFormat?: DateRangeFormatFunction | undefined
}
