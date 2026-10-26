import { beforeEach, describe, expect, it } from 'vitest';
import { FLAT_SHIPPING_CENTS, TEST_CARDS } from '@shop/shared';
import { prisma } from '../src/db';
import { checkoutBody, createProduct, newShopper, resetDatabase } from './helpers';

beforeEach(resetDatabase);

describe('checkout with the mock payment gateway', () => {
  it('saves a paid order, reduces stock and empties the cart when the test card succeeds', async () => {
    const product = await createProduct({ priceCents: 2000, stock: 5 });
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(201);

    const res = await shopper.post('/api/checkout').send(checkoutBody()).expect(201);

    expect(res.body).toMatchObject({
      status: 'PAID',
      email: 'ada@example.com',
      subtotalCents: 4000,
      taxCents: 400,
      shippingCents: FLAT_SHIPPING_CENTS,
      totalCents: 4400 + FLAT_SHIPPING_CENTS,
      paymentLast4: '4242',
    });
    expect(res.body.orderNumber).toMatch(/^SHP-[A-Z0-9]{8}$/);
    expect(res.body.items).toEqual([expect.objectContaining({ quantity: 2, unitPriceCents: 2000, lineTotalCents: 4000 })]);

    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock).toBe(3);
    expect((await shopper.get('/api/cart')).body.itemCount).toBe(0);
    expect(await prisma.order.count()).toBe(1);
  });

  it('saves nothing and keeps stock and cart when the card is declined', async () => {
    const product = await createProduct({ stock: 5 });
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(201);

    const res = await shopper.post('/api/checkout').send(checkoutBody(TEST_CARDS.declined)).expect(402);

    expect(res.body.error.code).toBe('PAYMENT_DECLINED');
    expect(await prisma.order.count()).toBe(0);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock).toBe(5);
    expect((await shopper.get('/api/cart')).body.itemCount).toBe(2);
  });

  it('refuses card numbers that are not test cards', async () => {
    const product = await createProduct();
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id }).expect(201);

    const res = await shopper.post('/api/checkout').send(checkoutBody('5555555555554444')).expect(402);
    expect(res.body.error.message).toContain('only accepts test cards');
    expect(await prisma.order.count()).toBe(0);
  });

  it('returns field errors for an invalid form and does not charge', async () => {
    const product = await createProduct();
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id }).expect(201);

    const body = checkoutBody();
    body.contact.email = 'nope';
    const res = await shopper.post('/api/checkout').send(body).expect(400);
    expect(res.body.error.fieldErrors).toHaveProperty(['contact.email']);
    expect(await prisma.order.count()).toBe(0);
  });

  it('rejects checkout with an empty cart', async () => {
    const res = await newShopper().post('/api/checkout').send(checkoutBody()).expect(400);
    expect(res.body.error.code).toBe('CART_EMPTY');
  });

  it('stops the order if stock ran out after the item was added to the cart', async () => {
    const product = await createProduct({ stock: 2 });
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(201);
    await prisma.product.update({ where: { id: product.id }, data: { stock: 1 } });

    const res = await shopper.post('/api/checkout').send(checkoutBody()).expect(409);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
    expect(await prisma.order.count()).toBe(0);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock).toBe(1);
  });

  it('never oversells when two shoppers race for the last unit', async () => {
    const product = await createProduct({ stock: 1 });
    const first = newShopper();
    const second = newShopper();
    await first.post('/api/cart/items').send({ productId: product.id }).expect(201);
    await second.post('/api/cart/items').send({ productId: product.id }).expect(201);

    const results = await Promise.all([
      first.post('/api/checkout').send(checkoutBody()),
      second.post('/api/checkout').send(checkoutBody()),
    ]);

    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock).toBe(0);
    expect(await prisma.order.count()).toBe(1);
  });
});

describe('order lookup', () => {
  async function placeOrder() {
    const product = await createProduct();
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id }).expect(201);
    const order = (await shopper.post('/api/checkout').send(checkoutBody()).expect(201)).body;
    return { shopper, order };
  }

  it('lists orders by email, case-insensitively', async () => {
    const { order } = await placeOrder();
    const res = await newShopper().get('/api/orders').query({ email: 'ADA@example.com' }).expect(200);
    expect(res.body.map((o: { orderNumber: string }) => o.orderNumber)).toEqual([order.orderNumber]);
  });

  it('returns an empty list for an email with no orders', async () => {
    await placeOrder();
    const res = await newShopper().get('/api/orders').query({ email: 'someone@else.com' }).expect(200);
    expect(res.body).toEqual([]);
  });

  it('shows an order to the session that placed it, or to someone who knows the email', async () => {
    const { shopper, order } = await placeOrder();
    await shopper.get(`/api/orders/${order.orderNumber}`).expect(200);
    await newShopper().get(`/api/orders/${order.orderNumber}`).expect(404);
    await newShopper().get(`/api/orders/${order.orderNumber}`).query({ email: 'ada@example.com' }).expect(200);
  });
});
