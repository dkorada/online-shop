/**
 * Pricing rules shared by the server (source of truth) and the client (display only).
 * All money values are integer cents to avoid floating point rounding errors.
 */

/** Sales tax applied to the merchandise subtotal, as a whole percentage. */
export const TAX_RATE_PERCENT = 10;

/** Flat shipping fee charged when the subtotal is below the free shipping threshold. */
export const FLAT_SHIPPING_CENTS = 799;

/** Orders with a subtotal at or above this amount ship for free. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

export interface PricedLine {
  unitPriceCents: number;
  quantity: number;
}

export interface Totals {
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingThresholdCents: number;
  /** How much more the shopper needs to add to qualify for free shipping (0 when qualified). */
  amountToFreeShippingCents: number;
}

export function calculateSubtotal(lines: readonly PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
}

/** Tax is calculated on the subtotal only (not on shipping) and rounded half-up to the nearest cent. */
export function calculateTax(subtotalCents: number): number {
  return Math.round((subtotalCents * TAX_RATE_PERCENT) / 100);
}

/** Empty carts ship for free; otherwise flat rate until the free shipping threshold is reached. */
export function calculateShipping(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}

export function calculateTotals(lines: readonly PricedLine[]): Totals {
  const subtotalCents = calculateSubtotal(lines);
  const taxCents = calculateTax(subtotalCents);
  const shippingCents = calculateShipping(subtotalCents);
  return {
    subtotalCents,
    taxCents,
    shippingCents,
    totalCents: subtotalCents + taxCents + shippingCents,
    freeShippingThresholdCents: FREE_SHIPPING_THRESHOLD_CENTS,
    amountToFreeShippingCents:
      subtotalCents > 0 ? Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents) : FREE_SHIPPING_THRESHOLD_CENTS,
  };
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100);
}
