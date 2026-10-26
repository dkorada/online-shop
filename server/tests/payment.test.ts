import { describe, expect, it } from 'vitest';
import { TEST_CARDS, checkoutSchema, isExpiryValid, passesLuhn, toFieldErrors } from '@shop/shared';
import { mockPaymentGateway } from '../src/services/paymentGateway';
import { checkoutBody } from './helpers';

describe('mock payment gateway', () => {
  it('approves the success test card and only keeps the last four digits', async () => {
    const result = await mockPaymentGateway.authorize({ amountCents: 1000, cardNumber: TEST_CARDS.success });
    expect(result).toMatchObject({ approved: true, brand: 'Visa', last4: '4242' });
  });

  it('declines the declined test card', async () => {
    const result = await mockPaymentGateway.authorize({ amountCents: 1000, cardNumber: TEST_CARDS.declined });
    expect(result).toMatchObject({ approved: false, declineCode: 'card_declined' });
  });

  it('refuses any card that is not a test card', async () => {
    const result = await mockPaymentGateway.authorize({ amountCents: 1000, cardNumber: '5555555555554444' });
    expect(result).toMatchObject({ approved: false, declineCode: 'test_card_required' });
  });
});

describe('card validation', () => {
  it('accepts both test cards under the Luhn check', () => {
    expect(passesLuhn(TEST_CARDS.success)).toBe(true);
    expect(passesLuhn(TEST_CARDS.declined)).toBe(true);
    expect(passesLuhn('4242424242424241')).toBe(false);
  });

  it('treats a card as valid through the end of its expiry month', () => {
    const now = new Date(2026, 9, 15); // 15 Oct 2026
    expect(isExpiryValid('10/26', now)).toBe(true);
    expect(isExpiryValid('09/26', now)).toBe(false);
    expect(isExpiryValid('13/30', now)).toBe(false);
  });
});

describe('checkout form validation', () => {
  it('normalises a valid submission', () => {
    const body = checkoutBody('4242 4242 4242 4242');
    const parsed = checkoutSchema.parse(body);
    expect(parsed.contact.email).toBe('ada@example.com');
    expect(parsed.payment.cardNumber).toBe(TEST_CARDS.success);
  });

  it('reports a message for each invalid field', () => {
    const result = checkoutSchema.safeParse({
      contact: { fullName: '', email: 'not-an-email', phone: 'abc' },
      shippingAddress: { line1: '', city: '', region: '', postalCode: '!', country: 'XX' },
      payment: { cardName: '', cardNumber: '1234', expiry: '1/2', cvc: '1' },
    });
    expect(result.success).toBe(false);
    const errors = toFieldErrors(result.error!);
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'contact.fullName',
        'contact.email',
        'contact.phone',
        'shippingAddress.line1',
        'shippingAddress.city',
        'shippingAddress.postalCode',
        'shippingAddress.country',
        'payment.cardNumber',
        'payment.expiry',
        'payment.cvc',
      ]),
    );
  });
});
