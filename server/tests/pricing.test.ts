import { describe, expect, it } from 'vitest';
import {
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  calculateShipping,
  calculateSubtotal,
  calculateTax,
  calculateTotals,
} from '@shop/shared';

describe('calculateSubtotal', () => {
  it('multiplies unit price by quantity for every line', () => {
    expect(
      calculateSubtotal([
        { unitPriceCents: 1999, quantity: 2 },
        { unitPriceCents: 500, quantity: 3 },
      ]),
    ).toBe(5498);
  });

  it('is zero for an empty cart', () => {
    expect(calculateSubtotal([])).toBe(0);
  });
});

describe('calculateTax', () => {
  it('charges 10% of the subtotal', () => {
    expect(calculateTax(10000)).toBe(1000);
    expect(calculateTax(4999)).toBe(500);
  });

  it('rounds half a cent up', () => {
    expect(calculateTax(1005)).toBe(101); // 100.5 cents
    expect(calculateTax(1004)).toBe(100); // 100.4 cents
  });

  it('is zero when there is nothing to tax', () => {
    expect(calculateTax(0)).toBe(0);
  });
});

describe('calculateShipping', () => {
  it('charges the flat rate below the free shipping threshold', () => {
    expect(calculateShipping(1)).toBe(FLAT_SHIPPING_CENTS);
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(FLAT_SHIPPING_CENTS);
  });

  it('is free at exactly the threshold and above', () => {
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD_CENTS + 12345)).toBe(0);
  });

  it('is not charged on an empty cart', () => {
    expect(calculateShipping(0)).toBe(0);
  });

  it('uses the subtotal before tax, so tax cannot push an order over the threshold', () => {
    const subtotal = FREE_SHIPPING_THRESHOLD_CENTS - 100; // subtotal + tax is above the threshold
    expect(subtotal + calculateTax(subtotal)).toBeGreaterThan(FREE_SHIPPING_THRESHOLD_CENTS);
    expect(calculateShipping(subtotal)).toBe(FLAT_SHIPPING_CENTS);
  });
});

describe('calculateTotals', () => {
  it('adds subtotal, tax and flat shipping for a small order', () => {
    const totals = calculateTotals([{ unitPriceCents: 2500, quantity: 2 }]);
    expect(totals).toMatchObject({
      subtotalCents: 5000,
      taxCents: 500,
      shippingCents: FLAT_SHIPPING_CENTS,
      totalCents: 5000 + 500 + FLAT_SHIPPING_CENTS,
      amountToFreeShippingCents: FREE_SHIPPING_THRESHOLD_CENTS - 5000,
    });
  });

  it('drops shipping once the order qualifies for free shipping', () => {
    const totals = calculateTotals([{ unitPriceCents: 4000, quantity: 2 }]);
    expect(totals).toMatchObject({
      subtotalCents: 8000,
      taxCents: 800,
      shippingCents: 0,
      totalCents: 8800,
      amountToFreeShippingCents: 0,
    });
  });

  it('returns all zeros for an empty cart', () => {
    expect(calculateTotals([])).toMatchObject({ subtotalCents: 0, taxCents: 0, shippingCents: 0, totalCents: 0 });
  });
});
