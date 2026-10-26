import request from 'supertest';
import { TEST_CARDS, type CheckoutInput } from '@shop/shared';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

export const app = createApp();

/** A supertest agent keeps cookies between requests, so it behaves like one shopper's browser. */
export const newShopper = () => request.agent(app);

export async function resetDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

let sequence = 0;

export async function createProduct(overrides: { name?: string; priceCents?: number; stock?: number } = {}) {
  sequence += 1;
  const category = await prisma.category.upsert({
    where: { slug: 'test' },
    create: { name: 'Test', slug: 'test' },
    update: {},
  });
  return prisma.product.create({
    data: {
      slug: `test-product-${sequence}`,
      name: overrides.name ?? `Test Product ${sequence}`,
      tagline: 'A product for tests',
      description: 'Used by the automated test suite.',
      priceCents: overrides.priceCents ?? 2000,
      stock: overrides.stock ?? 10,
      imageUrl: '/images/test.svg',
      categoryId: category.id,
    },
  });
}

export function checkoutBody(cardNumber: string = TEST_CARDS.success): CheckoutInput {
  return {
    contact: { fullName: 'Ada Lovelace', email: 'Ada@Example.com', phone: '+1 555 010 2030' },
    shippingAddress: {
      line1: '12 Analytical Engine Way',
      line2: '',
      city: 'London',
      region: 'Greater London',
      postalCode: 'nw1 6xe',
      country: 'GB',
    },
    payment: { cardName: 'Ada Lovelace', cardNumber, expiry: '12/39', cvc: '123' },
  };
}
