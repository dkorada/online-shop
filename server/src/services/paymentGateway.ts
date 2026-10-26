import { randomBytes } from 'node:crypto';
import { TEST_CARDS } from '@shop/shared';
import { config } from '../config';

/**
 * A stand-in for a real payment provider such as Stripe. Nothing leaves the server and no money moves.
 *
 *   4242 4242 4242 4242  -> approved
 *   4000 0000 0000 0002  -> declined (card_declined)
 *   anything else        -> declined (test_card_required), so real card numbers are never "charged"
 */
export type AuthorizationResult =
  | { approved: true; reference: string; brand: string; last4: string }
  | { approved: false; declineCode: 'card_declined' | 'test_card_required'; message: string };

export interface AuthorizationRequest {
  amountCents: number;
  cardNumber: string;
}

function detectBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return 'Mastercard';
  if (/^3[47]/.test(cardNumber)) return 'American Express';
  return 'Card';
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockPaymentGateway = {
  async authorize({ amountCents, cardNumber }: AuthorizationRequest): Promise<AuthorizationResult> {
    if (config.mockPaymentDelayMs > 0) await wait(config.mockPaymentDelayMs);

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new Error('Payment amount must be a positive number of cents');
    }

    if (cardNumber === TEST_CARDS.success) {
      return {
        approved: true,
        reference: `mock_${randomBytes(8).toString('hex')}`,
        brand: detectBrand(cardNumber),
        last4: cardNumber.slice(-4),
      };
    }

    if (cardNumber === TEST_CARDS.declined) {
      return { approved: false, declineCode: 'card_declined', message: 'Your card was declined. Please use a different card.' };
    }

    return {
      approved: false,
      declineCode: 'test_card_required',
      message: 'This is a demo store and only accepts test cards. Use 4242 4242 4242 4242 to complete your order.',
    };
  },

  /** Releases an approved authorization when the order cannot be saved (e.g. stock sold out mid-checkout). */
  async void(_reference: string): Promise<void> {
    // Nothing to release in the mock gateway. A real integration would cancel the payment intent here.
  },
};
