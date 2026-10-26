import { emailSchema, formatMoney, type Order } from '@shop/shared';
import { ChevronDown, Inbox, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { InputField } from '../components/FormField';
import { OrderDetails, formatOrderDate } from '../components/OrderDetails';
import { Button, EmptyState, ErrorState, Skeleton } from '../components/ui';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; email: string; orders: Order[] };

function OrderCard({ order, defaultOpen }: { order: Order; defaultOpen: boolean }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <details className="card order-card" open={defaultOpen}>
      <summary>
        <div className="order-card__summary">
          <div>
            <span className="order-card__number">{order.orderNumber}</span>
            <span className="muted small">{formatOrderDate(order.createdAt)}</span>
          </div>
          <span className="muted small hide-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="badge badge--success">Paid</span>
          <span className="order-card__total">{formatMoney(order.totalCents)}</span>
          <ChevronDown size={18} className="order-card__chevron" aria-hidden />
        </div>
      </summary>
      <div className="order-card__body">
        <OrderDetails order={order} />
        <Link to={`/orders/${order.orderNumber}?email=${encodeURIComponent(order.email)}`} className="link-button">
          Open order page →
        </Link>
      </div>
    </details>
  );
}

export function OrderHistoryPage() {
  useDocumentTitle('Order history');
  const [params, setParams] = useSearchParams();
  const emailParam = params.get('email') ?? '';
  const [email, setEmail] = useState(emailParam);
  const [inputError, setInputError] = useState<string>();
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' });

  useEffect(() => {
    if (!emailParam) {
      setLookup({ status: 'idle' });
      return;
    }
    setEmail(emailParam);
    let cancelled = false;
    setLookup({ status: 'loading' });
    api.ordersByEmail(emailParam).then(
      (orders) => !cancelled && setLookup({ status: 'done', email: emailParam, orders }),
      (error: unknown) =>
        !cancelled &&
        setLookup({ status: 'error', message: error instanceof ApiError ? error.message : 'Could not load your orders.' }),
    );
    return () => {
      cancelled = true;
    };
  }, [emailParam]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setInputError(parsed.error.issues[0]?.message);
      return;
    }
    setInputError(undefined);
    setParams({ email: parsed.data });
  };

  return (
    <div className="container section narrow">
      <h1 className="page-title">Order history</h1>
      <p className="muted">Enter the email address you used at checkout to see your orders.</p>

      <form className="card lookup-form" onSubmit={submit} noValidate>
        <InputField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={inputError}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" loading={lookup.status === 'loading'}>
          <Search size={16} aria-hidden /> Find orders
        </Button>
      </form>

      {lookup.status === 'loading' && (
        <div className="stack">
          <Skeleton className="skeleton--row" />
          <Skeleton className="skeleton--row" />
        </div>
      )}
      {lookup.status === 'error' && <ErrorState message={lookup.message} onRetry={() => setParams({ email: emailParam })} />}
      {lookup.status === 'done' &&
        (lookup.orders.length === 0 ? (
          <EmptyState icon={<Inbox size={28} aria-hidden />} title="No orders yet" action={<Link to="/" className="btn btn--primary">Start shopping</Link>}>
            We couldn’t find any orders for {lookup.email}.
          </EmptyState>
        ) : (
          <section className="stack" aria-label="Your orders">
            <p className="muted small">
              {lookup.orders.length} {lookup.orders.length === 1 ? 'order' : 'orders'} for <strong>{lookup.email}</strong>
            </p>
            {lookup.orders.map((order, index) => (
              <OrderCard key={order.orderNumber} order={order} defaultOpen={index === 0} />
            ))}
          </section>
        ))}
    </div>
  );
}
