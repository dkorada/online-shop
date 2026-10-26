import { beforeEach, describe, expect, it } from 'vitest';
import { FLAT_SHIPPING_CENTS } from '@shop/shared';
import { prisma } from '../src/db';
import { createProduct, newShopper, resetDatabase } from './helpers';

beforeEach(resetDatabase);

describe('cart', () => {
  it('keeps a separate cart for each session', async () => {
    const product = await createProduct();
    const alice = newShopper();
    const bob = newShopper();

    await alice.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(201);

    expect((await alice.get('/api/cart')).body.itemCount).toBe(2);
    expect((await bob.get('/api/cart')).body.itemCount).toBe(0);
  });

  it('adds, changes quantity and removes items with live totals', async () => {
    const product = await createProduct({ priceCents: 1500, stock: 10 });
    const shopper = newShopper();

    let cart = (await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 1 }).expect(201)).body;
    cart = (await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 1 }).expect(201)).body;
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.totals).toMatchObject({ subtotalCents: 3000, taxCents: 300, shippingCents: FLAT_SHIPPING_CENTS });

    cart = (await shopper.patch(`/api/cart/items/${product.id}`).send({ quantity: 5 }).expect(200)).body;
    expect(cart.totals).toMatchObject({ subtotalCents: 7500, taxCents: 750, shippingCents: 0, totalCents: 8250 });

    cart = (await shopper.delete(`/api/cart/items/${product.id}`).expect(200)).body;
    expect(cart.items).toHaveLength(0);
    expect(cart.totals.totalCents).toBe(0);
  });

  it('removes a line when its quantity is set to zero', async () => {
    const product = await createProduct();
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id }).expect(201);

    const cart = (await shopper.patch(`/api/cart/items/${product.id}`).send({ quantity: 0 }).expect(200)).body;
    expect(cart.items).toHaveLength(0);
  });

  it('rejects invalid quantities', async () => {
    const product = await createProduct();
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: -1 }).expect(400);
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 1.5 }).expect(400);
  });
});

describe('stock checks when adding to cart', () => {
  it('refuses to add an out of stock product', async () => {
    const product = await createProduct({ stock: 0 });
    const res = await newShopper().post('/api/cart/items').send({ productId: product.id, quantity: 1 }).expect(409);
    expect(res.body.error.code).toBe('OUT_OF_STOCK');
  });

  it('refuses more units than are in stock', async () => {
    const product = await createProduct({ stock: 3 });
    const res = await newShopper().post('/api/cart/items').send({ productId: product.id, quantity: 4 }).expect(409);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('counts units already in the cart', async () => {
    const product = await createProduct({ stock: 3 });
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(201);

    const res = await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(409);
    expect(res.body.error.message).toContain('You already have 2 in your cart');
    expect((await shopper.get('/api/cart')).body.items[0].quantity).toBe(2);
  });

  it('allows adding exactly the remaining stock', async () => {
    const product = await createProduct({ stock: 3 });
    await newShopper().post('/api/cart/items').send({ productId: product.id, quantity: 3 }).expect(201);
  });

  it('refuses to raise a cart quantity above stock', async () => {
    const product = await createProduct({ stock: 3 });
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 1 }).expect(201);
    await shopper.patch(`/api/cart/items/${product.id}`).send({ quantity: 4 }).expect(409);
  });

  it('flags cart lines that are no longer available after stock drops', async () => {
    const product = await createProduct({ stock: 5 });
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: product.id, quantity: 4 }).expect(201);
    await prisma.product.update({ where: { id: product.id }, data: { stock: 2 } });

    const cart = (await shopper.get('/api/cart')).body;
    expect(cart.items[0]).toMatchObject({ available: false, stock: 2 });
  });
});
