/**
 * Direct ePOS-Print XML printing to Epson TM-T88VII
 * Works when the device is on the same WiFi as the printer.
 * Falls back gracefully when the printer is unreachable.
 */
import { Order } from './types'

const PRINTER_IP = process.env.NEXT_PUBLIC_PRINTER_IP ?? ''
const EPOS_URL   = `https://${PRINTER_IP}/cgi-bin/epos/service.cgi`

// ── Helpers ─────────────────────────────────────────────────────────────────

function xmlEsc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return raw
}

/** Left-label, right-value row padded to `width` chars */
function padRow(label: string, value: string, width = 42): string {
  const safe = value.length > width - label.length - 1
    ? value.slice(0, width - label.length - 1)
    : value
  return label + ' '.repeat(Math.max(1, width - label.length - safe.length)) + safe
}

// ── XML builder ──────────────────────────────────────────────────────────────

export function buildEPOSXml(order: Order): string {
  const NL   = '&#10;'
  const DIV1 = '='.repeat(42) + NL
  const DIV2 = '-'.repeat(42) + NL

  // Detail rows
  const rows: [string, string][] = [
    ['CUSTOMER:', order.customerName],
    ['PHONE:',    formatPhone(order.phone)],
    ['DROP-OFF:', formatDate(order.dropoffDate)],
    ['DUE DATE:', formatDate(order.dueDate)],
  ]
  if (order.totalAmount != null) rows.push(['TOTAL:', `$${order.totalAmount.toFixed(2)}`])
  if (order.itemCount   != null) rows.push(['ITEMS:', `${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}`])

  const detailLines = rows
    .map(([l, v]) => `      <text>${xmlEsc(padRow(l, v))}${NL}</text>`)
    .join('\n')

  const notesSection = order.notes
    ? `      <text>${DIV2}</text>
      <text em="true">NOTES:${NL}</text>
      <text>${xmlEsc(order.notes)}${NL}</text>`
    : ''

  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
      <text align="center" dh="true" dw="true">Straus Tailor Shop${NL}</text>
      <text dh="false" dw="false"/>
      <text align="center">1326 25th St S Suite B${NL}</text>
      <text align="center">Fargo, ND 58103${NL}</text>
      <text align="center">(701) 929-8262${NL}</text>
      <text align="center">${DIV1}</text>
      <text align="center">ORDER ID${NL}</text>
      <text align="center" dh="true" dw="true">${xmlEsc(order.id)}${NL}</text>
      <text dh="false" dw="false"/>
      <text align="center" em="true">${order.paid ? '*** PAID ***' : '--- UNPAID ---'}${NL}</text>
      <text align="left">${DIV2}</text>
${detailLines}
${notesSection}
      <text>${DIV1}</text>
      <text align="center">Thank you for your business!${NL}</text>
      <feed line="3"/>
      <cut type="feed"/>
    </epos-print>
  </s:Body>
</s:Envelope>`
}

// ── Print function ───────────────────────────────────────────────────────────

/**
 * Sends a print job directly to the Epson printer via ePOS-Print XML.
 * Returns true on success, false if unreachable or CORS blocked.
 * Designed to fail silently so the caller can fall back to queue mode.
 */
export async function printDirect(order: Order): Promise<boolean> {
  if (!PRINTER_IP) return false

  try {
    const res = await fetch(EPOS_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction':   '""',
      },
      body: buildEPOSXml(order),
      // Short timeout — if printer unreachable, fail fast
      signal: AbortSignal.timeout(4000),
    })
    return res.ok
  } catch {
    // Network error, timeout, CORS, or cert not trusted — fall through to queue
    return false
  }
}
