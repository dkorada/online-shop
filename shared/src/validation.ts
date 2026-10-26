import { z } from 'zod';
import { normalizeCardNumber, passesLuhn } from './payment';

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SG', name: 'Singapore' },
] as const;

const countryCodes = COUNTRIES.map((c) => c.code) as [string, ...string[]];

const requiredText = (label: string, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'))
  .transform((email) => email.toLowerCase());

export const contactSchema = z.object({
  fullName: requiredText('Full name').min(2, 'Enter your full name'),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s().-]{7,20}$/, 'Enter a valid phone number')
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
});

export const addressSchema = z.object({
  line1: requiredText('Address', 120),
  line2: z.string().trim().max(120, 'Address line 2 must be 120 characters or fewer').optional().default(''),
  city: requiredText('City', 80),
  region: requiredText('State / region', 80),
  postalCode: z
    .string()
    .trim()
    .min(1, 'Postal code is required')
    .regex(/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/, 'Enter a valid postal code'),
  country: z.enum(countryCodes, 'Select a country'),
});

/** Parses "MM/YY" and checks that the card has not expired (cards are valid through the end of the month). */
export function isExpiryValid(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const endOfExpiryMonth = new Date(year, month, 1);
  return endOfExpiryMonth > now;
}

export const paymentSchema = z.object({
  cardName: requiredText('Name on card'),
  cardNumber: z
    .string()
    .transform(normalizeCardNumber)
    .pipe(
      z
        .string()
        .min(1, 'Card number is required')
        .regex(/^\d{12,19}$/, 'Card number must be 12 to 19 digits')
        .refine(passesLuhn, 'Card number is invalid'),
    ),
  expiry: z
    .string()
    .trim()
    .min(1, 'Expiry date is required')
    .regex(/^\d{2}\s*\/\s*\d{2}$/, 'Use the MM/YY format')
    .refine((v) => isExpiryValid(v), 'This card has expired'),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),
});

export const checkoutSchema = z.object({
  contact: contactSchema,
  shippingAddress: addressSchema,
  payment: paymentSchema,
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

/** Flattens zod issues into a `{ "contact.email": "message" }` map that forms can display directly. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
