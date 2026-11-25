// Tailors who can be credited on an order (order details → Tailor)
export const TAILORS = ['Pabitra', 'Anna', 'Tina', 'Lok', 'Bishal', 'Puja']

/** Names in the list's order; any others (e.g. someone no longer listed) after them */
export function sortTailors(names: string[]): string[] {
  const rank = (name: string) => {
    const i = TAILORS.indexOf(name)
    return i === -1 ? TAILORS.length : i
  }
  return [...names].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

// Staff who can take an order in (customer form → Staff Details → Received by)
export const RECEIVERS = ['Pabitra', 'Anna', 'Tina', 'Lok', 'Bishal']

/** Clean up a Received by name from a request: trimmed; null when none picked */
export function normalizeReceiver(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  return raw.trim().slice(0, 40) || null
}

/** Clean up a tailors list from a request: trimmed, no repeats, list order; null when empty */
export function normalizeTailors(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null
  const names = [...new Set(
    raw
      .filter((n): n is string => typeof n === 'string')
      .map(n => n.trim().slice(0, 40))
      .filter(Boolean)
  )].slice(0, 10)
  return names.length ? sortTailors(names) : null
}
