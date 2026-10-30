// Texts the shop sends customers automatically

/**
 * The first text: the order confirmation, sent when an order is created (if the customer
 * agreed to texts) and again from the order page's Test SMS button.
 */
export function confirmationText(order: { customerName: string; dueDate: string; paid?: boolean; totalAmount?: number }): string {
  const firstName = order.customerName.split(' ')[0]
  const dueShort = new Date(order.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const paymentLine = order.paid
    ? order.totalAmount != null
      ? `Amount paid: $${order.totalAmount.toFixed(2)}`
      : `Payment received — thank you.`
    : order.totalAmount != null
      ? `Balance due: $${order.totalAmount.toFixed(2)}`
      : null
  return [
    `Straus Tailor Shop`,
    ``,
    `Hi ${firstName} — thank you for visiting us today.`,
    ``,
    `Your order will be ready for pickup by ${dueShort}.`,
    ``,
    ...(paymentLine ? [paymentLine, ``] : []),
    `We'll send you a text as soon as it's ready.`,
    ``,
    `Questions? 701-715-5944`,
    `Reply STOP to opt out.`,
  ].join('\n')
}
