import type { Order } from '@shop/shared';
import { COUNTRIES, formatMoney } from '@shop/shared';
import { CreditCard, MapPin } from 'lucide-react';
import { TotalsTable } from './OrderSummary';

export const formatOrderDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;

export function OrderItems({ order }: { order: Order }) {
  return (
    <ul className="order-items">
      {order.items.map((item, index) => (
        <li key={`${item.productId}-${index}`}>
          <img src={item.imageUrl} alt="" width={64} height={64} />
          <div>
            <span className="order-items__name">{item.productName}</span>
            <span className="muted small">
              {item.quantity} × {formatMoney(item.unitPriceCents)}
            </span>
          </div>
          <span className="order-items__total">{formatMoney(item.lineTotalCents)}</span>
        </li>
      ))}
    </ul>
  );
}

export function OrderDetails({ order }: { order: Order }) {
  const { shippingAddress: a } = order;
  return (
    <div className="order-details">
      <OrderItems order={order} />
      <TotalsTable totals={order} />
      <div className="order-details__meta">
        <div>
          <h3>
            <MapPin size={16} aria-hidden /> Shipping to
          </h3>
          <address>
            {order.fullName}
            <br />
            {a.line1}
            {a.line2 && (
              <>
                <br />
                {a.line2}
              </>
            )}
            <br />
            {a.city}, {a.region} {a.postalCode}
            <br />
            {countryName(a.country)}
          </address>
        </div>
        <div>
          <h3>
            <CreditCard size={16} aria-hidden /> Payment
          </h3>
          <p>
            {order.paymentBrand} ending in {order.paymentLast4}
            <br />
            <span className="badge badge--success">Paid · test mode</span>
          </p>
        </div>
      </div>
    </div>
  );
}
