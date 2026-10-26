import type { Totals } from '@shop/shared';
import { TAX_RATE_PERCENT, formatMoney } from '@shop/shared';
import { Truck } from 'lucide-react';
import type { ReactNode } from 'react';

type SummaryTotals = Pick<Totals, 'subtotalCents' | 'taxCents' | 'shippingCents' | 'totalCents'> &
  Partial<Pick<Totals, 'amountToFreeShippingCents' | 'freeShippingThresholdCents'>>;

export function FreeShippingProgress({ totals }: { totals: Totals }) {
  const progress = Math.min(100, (totals.subtotalCents / totals.freeShippingThresholdCents) * 100);
  const qualified = totals.amountToFreeShippingCents === 0;
  return (
    <div className={`shipping-progress ${qualified ? 'shipping-progress--done' : ''}`}>
      <p>
        <Truck size={16} aria-hidden />
        {qualified ? (
          <span>You’ve unlocked free shipping.</span>
        ) : (
          <span>
            Add <strong>{formatMoney(totals.amountToFreeShippingCents)}</strong> more for free shipping.
          </span>
        )}
      </p>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function TotalsTable({ totals }: { totals: SummaryTotals }) {
  return (
    <dl className="totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{formatMoney(totals.subtotalCents)}</dd>
      </div>
      <div>
        <dt>Tax ({TAX_RATE_PERCENT}%)</dt>
        <dd>{formatMoney(totals.taxCents)}</dd>
      </div>
      <div>
        <dt>Shipping</dt>
        <dd>{totals.shippingCents === 0 ? <span className="text-success">Free</span> : formatMoney(totals.shippingCents)}</dd>
      </div>
      <div className="totals__grand">
        <dt>Total</dt>
        <dd>{formatMoney(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}

export function SummaryCard({ title = 'Order summary', children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="card summary-card" aria-label={title}>
      <h2 className="card__title">{title}</h2>
      {children}
    </aside>
  );
}
