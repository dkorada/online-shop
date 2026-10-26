import type { Prisma } from '@prisma/client';
import type { Order } from '@shop/shared';
import { prisma } from '../db';
import { notFound } from '../errors';

const orderInclude = { items: { orderBy: { id: 'asc' } } } as const;
type OrderRecord = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function toOrder(record: OrderRecord): Order {
  return {
    orderNumber: record.orderNumber,
    status: 'PAID',
    email: record.email,
    fullName: record.fullName,
    phone: record.phone,
    shippingAddress: {
      line1: record.shipLine1,
      line2: record.shipLine2,
      city: record.shipCity,
      region: record.shipRegion,
      postalCode: record.shipPostalCode,
      country: record.shipCountry,
    },
    items: record.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      imageUrl: item.imageUrl,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
    subtotalCents: record.subtotalCents,
    taxCents: record.taxCents,
    shippingCents: record.shippingCents,
    totalCents: record.totalCents,
    paymentBrand: record.paymentBrand,
    paymentLast4: record.paymentLast4,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function listOrdersByEmail(email: string): Promise<Order[]> {
  const records = await prisma.order.findMany({
    where: { email: email.toLowerCase() },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  return records.map(toOrder);
}

/**
 * An order can be viewed by the browser session that placed it, or by anyone who also knows the email
 * it was placed with. This keeps order numbers alone from exposing customer details.
 */
export async function getOrder(orderNumber: string, access: { sessionId: string; email?: string }): Promise<Order> {
  const record = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
  const allowed =
    record && (record.sessionId === access.sessionId || (access.email && record.email === access.email.toLowerCase()));
  if (!record || !allowed) throw notFound('We couldn’t find that order.');
  return toOrder(record);
}
