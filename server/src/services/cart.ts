import type { Cart } from '@shop/shared';
import { calculateTotals } from '@shop/shared';
import { config } from '../config';
import { prisma, type Tx } from '../db';
import { AppError, notFound } from '../errors';
import { hasStockFor, insufficientStock } from './stock';

const cartItemsQuery = {
  include: { product: true },
  orderBy: { createdAt: 'asc' },
} as const;

async function loadCartItems(sessionId: string, db: Tx | typeof prisma = prisma) {
  return db.cartItem.findMany({ where: { cartId: sessionId }, ...cartItemsQuery });
}

export async function getCart(sessionId: string): Promise<Cart> {
  const records = await loadCartItems(sessionId);
  const items = records.map(({ product, quantity }) => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.imageUrl,
    unitPriceCents: product.priceCents,
    quantity,
    lineTotalCents: product.priceCents * quantity,
    stock: product.stock,
    available: quantity <= product.stock,
  }));

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totals: calculateTotals(items),
  };
}

function assertQuantity(quantity: number) {
  if (quantity > config.maxQuantityPerItem) {
    throw new AppError(400, 'QUANTITY_LIMIT', `You can buy up to ${config.maxQuantityPerItem} of each item per order.`);
  }
}

/** Adds units to the cart after checking that cart quantity plus new units fit in current stock. */
export async function addItem(sessionId: string, productId: number, quantity: number): Promise<Cart> {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw notFound('That product no longer exists.');

    const existing = await tx.cartItem.findUnique({ where: { cartId_productId: { cartId: sessionId, productId } } });
    const inCart = existing?.quantity ?? 0;
    const nextQuantity = inCart + quantity;

    assertQuantity(nextQuantity);
    if (!hasStockFor(product.stock, nextQuantity)) throw insufficientStock(product.name, product.stock, inCart);

    await tx.cart.upsert({ where: { id: sessionId }, create: { id: sessionId }, update: {} });
    await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: sessionId, productId } },
      create: { cartId: sessionId, productId, quantity: nextQuantity },
      update: { quantity: nextQuantity },
    });
  });
  return getCart(sessionId);
}

/** Sets an exact quantity for a cart line. A quantity of 0 removes the line. */
export async function updateItemQuantity(sessionId: string, productId: number, quantity: number): Promise<Cart> {
  if (quantity === 0) return removeItem(sessionId, productId);

  await prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: sessionId, productId } },
      include: { product: true },
    });
    if (!item) throw notFound('That item is not in your cart.');

    assertQuantity(quantity);
    if (!hasStockFor(item.product.stock, quantity)) throw insufficientStock(item.product.name, item.product.stock);

    await tx.cartItem.update({ where: { id: item.id }, data: { quantity } });
  });
  return getCart(sessionId);
}

export async function removeItem(sessionId: string, productId: number): Promise<Cart> {
  await prisma.cartItem.deleteMany({ where: { cartId: sessionId, productId } });
  return getCart(sessionId);
}

export async function clearCart(sessionId: string, db: Tx | typeof prisma = prisma): Promise<void> {
  await db.cartItem.deleteMany({ where: { cartId: sessionId } });
}

export { loadCartItems };
