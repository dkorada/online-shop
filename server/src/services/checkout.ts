import { randomBytes } from 'node:crypto';
import { calculateTotals, type CheckoutData, type Order } from '@shop/shared';
import { prisma } from '../db';
import { AppError } from '../errors';
import { clearCart, loadCartItems } from './cart';
import { toOrder } from './orders';
import { mockPaymentGateway } from './paymentGateway';
import { hasStockFor, insufficientStock } from './stock';

/** Human friendly, hard to guess order number, e.g. "SHP-7K3QX9MD". */
function generateOrderNumber(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = randomBytes(8);
  return `SHP-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

type CartLines = Awaited<ReturnType<typeof loadCartItems>>;

function assertCartCanBeFulfilled(lines: CartLines) {
  if (lines.length === 0) throw new AppError(400, 'CART_EMPTY', 'Your cart is empty.');
  for (const line of lines) {
    if (!hasStockFor(line.product.stock, line.quantity)) {
      throw insufficientStock(line.product.name, line.product.stock);
    }
  }
}

/**
 * Places an order for the session's cart.
 *
 * 1. Re-check stock and price the cart on the server (client totals are never trusted).
 * 2. Ask the mock gateway to authorize the payment. A decline stops here and nothing is written.
 * 3. In one transaction: decrement stock (guarded so it can't go negative), save the order, empty the cart.
 *    If that fails, for example because another shopper bought the last unit, the authorization is voided.
 */
export async function placeOrder(sessionId: string, data: CheckoutData): Promise<Order> {
  const lines = await loadCartItems(sessionId);
  assertCartCanBeFulfilled(lines);

  const pricedLines = lines.map((line) => ({ unitPriceCents: line.product.priceCents, quantity: line.quantity }));
  const totals = calculateTotals(pricedLines);

  const payment = await mockPaymentGateway.authorize({
    amountCents: totals.totalCents,
    cardNumber: data.payment.cardNumber,
  });
  if (!payment.approved) {
    throw new AppError(402, 'PAYMENT_DECLINED', payment.message, { 'payment.cardNumber': payment.message });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Re-read inside the transaction so we price and decrement exactly what is in the cart now.
      const current = await loadCartItems(sessionId, tx);
      assertCartCanBeFulfilled(current);
      const currentTotals = calculateTotals(
        current.map((line) => ({ unitPriceCents: line.product.priceCents, quantity: line.quantity })),
      );
      if (currentTotals.totalCents !== totals.totalCents) {
        throw new AppError(409, 'CART_CHANGED', 'Your cart changed while checking out. Please review it and try again.');
      }

      for (const line of current) {
        const { count } = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (count === 0) throw insufficientStock(line.product.name, line.product.stock);
      }

      const { contact, shippingAddress } = data;
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          sessionId,
          email: contact.email,
          fullName: contact.fullName,
          phone: contact.phone,
          shipLine1: shippingAddress.line1,
          shipLine2: shippingAddress.line2 ?? '',
          shipCity: shippingAddress.city,
          shipRegion: shippingAddress.region,
          shipPostalCode: shippingAddress.postalCode.toUpperCase(),
          shipCountry: shippingAddress.country,
          subtotalCents: currentTotals.subtotalCents,
          taxCents: currentTotals.taxCents,
          shippingCents: currentTotals.shippingCents,
          totalCents: currentTotals.totalCents,
          paymentBrand: payment.brand,
          paymentLast4: payment.last4,
          paymentRef: payment.reference,
          items: {
            create: current.map((line) => ({
              productId: line.productId,
              productName: line.product.name,
              imageUrl: line.product.imageUrl,
              unitPriceCents: line.product.priceCents,
              quantity: line.quantity,
              lineTotalCents: line.product.priceCents * line.quantity,
            })),
          },
        },
        include: { items: { orderBy: { id: 'asc' } } },
      });

      await clearCart(sessionId, tx);
      return created;
    });
    return toOrder(order);
  } catch (error) {
    await mockPaymentGateway.void(payment.reference);
    throw error;
  }
}
