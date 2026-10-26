/**
 * Test cards understood by the mock payment gateway. No real payment provider is involved:
 * any other card number is rejected so that real card details are never accepted by the demo.
 */
export const TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
} as const;

export function normalizeCardNumber(value: string): string {
  return value.replace(/[\s-]/g, '');
}

/** Luhn checksum, the same check digit algorithm real card numbers use. */
export function passesLuhn(cardNumber: string): boolean {
  if (!/^\d+$/.test(cardNumber)) return false;
  let sum = 0;
  let double = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = Number(cardNumber[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Groups digits in blocks of four for display, e.g. "4242 4242 4242 4242". */
export function formatCardNumber(value: string): string {
  return normalizeCardNumber(value)
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}
