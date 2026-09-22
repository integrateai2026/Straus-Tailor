// Phone helpers shared by server and client code

/** Digits only, with a leading US country code dropped: "+1 (701) 555-0142" → "7015550142" */
export function phoneDigits(raw: string): string {
  const d = String(raw ?? '').replace(/\D/g, '')
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d
}

/** Display format: "(701) 555-0142" — non-US numbers keep their country code */
export function formatPhone(raw: string): string {
  const d = phoneDigits(raw)
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length > 10) return `+${d}`
  return raw
}
