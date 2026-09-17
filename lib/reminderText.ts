import type { Order } from './types'

// Texting providers reject any single message over 1,600 characters.
// Stay under that with room to spare for the "(1/2)" part label.
const MAX_CHARS = 1500
const NOTE_MAX = 100

const HEADER = '⚠️ Straus — Orders to Notify'
const FOOTER = 'Check dashboard to notify.'

export interface ReminderSection {
  title: string
  orders: Order[]
}

function priceLine(o: Order): string {
  if (o.totalAmount != null) return `$${o.totalAmount.toFixed(2)} · ${o.paid ? 'Paid' : 'Unpaid'}`
  return o.paid ? 'Paid · no price entered' : 'No price entered'
}

// Notes collapse to one line and are cut off when long; the full note stays in the dashboard
function noteLine(o: Order): string | null {
  const note = (o.notes ?? '').replace(/\s+/g, ' ').trim()
  if (!note) return null
  return `Note: ${note.length > NOTE_MAX ? note.slice(0, NOTE_MAX - 1).trimEnd() + '…' : note}`
}

function orderBlock(o: Order): string {
  const lines = [`• ${o.customerName} — ${o.phone}`, `  ${priceLine(o)}`]
  const note = noteLine(o)
  if (note) lines.push(`  ${note}`)
  return lines.join('\n')
}

interface Group { title: string; continued: boolean; blocks: string[] }

function render(groups: Group[], label: string, withFooter: boolean): string {
  const parts = [HEADER + label]
  for (const g of groups) {
    parts.push(g.continued ? `${g.title} (cont.)` : g.title)
    parts.push(g.blocks.join('\n\n'))
  }
  if (withFooter) parts.push(FOOTER)
  return parts.join('\n\n')
}

/**
 * Build the staff reminder as one or more texts. Orders are never split
 * across texts; a section that continues into the next text is marked (cont.).
 */
export function buildReminderTexts(sections: ReminderSection[]): string[] {
  const pages: Group[][] = [[]]

  for (const section of sections) {
    for (const order of section.orders) {
      const block = orderBlock(order)
      const page = pages[pages.length - 1]
      const last = page[page.length - 1]

      // Try adding this order to the current text (measured with a worst-case label and footer)
      const trial = last && last.title === section.title
        ? [...page.slice(0, -1), { ...last, blocks: [...last.blocks, block] }]
        : [...page, { title: section.title, continued: false, blocks: [block] }]

      if (page.length === 0 || render(trial, ' (99/99)', true).length <= MAX_CHARS) {
        pages[pages.length - 1] = trial
      } else {
        // Start a new text; mark the section as continued if it began in the previous one
        const continued = last?.title === section.title
        pages.push([{ title: section.title, continued, blocks: [block] }])
      }
    }
  }

  const total = pages.length
  return pages.map((groups, i) =>
    render(groups, total > 1 ? ` (${i + 1}/${total})` : '', i === total - 1)
  )
}
