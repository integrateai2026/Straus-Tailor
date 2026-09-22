// Big US holidays, marked on the Need By calendar (actual dates, not "observed" weekdays)

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Day of the month of the nth given weekday (0 = Sunday), e.g. the 4th Thursday of November
function nthWeekday(year: number, month: number, weekday: number, n: number): number {
  const first = new Date(year, month - 1, 1).getDay()
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7
}

function lastWeekday(year: number, month: number, weekday: number): number {
  const lastDay = new Date(year, month, 0)
  return lastDay.getDate() - ((lastDay.getDay() - weekday + 7) % 7)
}

// Easter Sunday — the Anonymous Gregorian algorithm
function easter(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

/** Holiday name by date (YYYY-MM-DD) for one year */
export function holidaysIn(year: number): Record<string, string> {
  const e = easter(year)
  return {
    [isoDate(year, 1, 1)]:                        "New Year's Day",
    [isoDate(year, e.month, e.day)]:              'Easter',
    [isoDate(year, 5, lastWeekday(year, 5, 1))]:  'Memorial Day',
    [isoDate(year, 7, 4)]:                        'Independence Day',
    [isoDate(year, 9, nthWeekday(year, 9, 1, 1))]:  'Labor Day',
    [isoDate(year, 11, nthWeekday(year, 11, 4, 4))]: 'Thanksgiving',
    [isoDate(year, 12, 24)]:                      'Christmas Eve',
    [isoDate(year, 12, 25)]:                      'Christmas',
    [isoDate(year, 12, 31)]:                      "New Year's Eve",
  }
}
