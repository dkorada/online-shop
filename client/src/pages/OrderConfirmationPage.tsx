import type { Order } from '@shop/shared';
import { CheckCircle2, SearchX } from 'lucide-react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { OrderDetails, formatOrderDate } from '../components/OrderDetails';
import { EmptyState, ErrorState, Skeleton } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function OrderConfirmationPage() {
  const { orderNumber = '' } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const state = location.state as { order?: Order; justPlaced?: boolean } | null;
  const email = params.get('email') ?? undefined;

  const preloaded = state?.order?.orderNumber === orderNumber ? state.order : undefined;
  const fetched = useAsync(
    () => (preloaded ? Promise.resolve(preloaded) : api.order(orderNumber, email)),
    [orderNumber, email],
  );
  const order = fetched.data;
  useDocumentTitle(order ? `Order ${order.orderNumber}` : 'Order');

  if (fetched.error) {
    if (fetched.error instanceof ApiError && fetched.error.status === 404) {
      return (
        <div className="container section">
          <EmptyState
            icon={<SearchX size={28} aria-hidden />}
            title="Order not found"
            action={
              <Link className="btn btn--primary" to="/orders">
                Look up your orders
              </Link>
            }
          >
            Use the email address you checked out with to find your orders.
          </EmptyState>
        </div>
      );
    }
    return (
      <div className="container section">
        <ErrorState message={fetched.error.message} onRetry={fetched.retry} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container section narrow">
        <Skeleton className="skeleton--title" />
        <Skeleton className="skeleton--panel" />
      </div>
    );
  }

  const firstName = order.fullName.split(' ')[0];

  return (
    <div className="container section narrow">
      <div className="confirmation-hero">
        <div className="confirmation-hero__icon">
          <CheckCircle2 size={36} aria-hidden />
        </div>
        <h1 className="page-title">{state?.justPlaced ? `Thank you, ${firstName}!` : `Order ${order.orderNumber}`}</h1>
        <p className="muted">
          {state?.justPlaced ? 'Your order is confirmed. ' : ''}
          Order <strong>{order.orderNumber}</strong> · placed {formatOrderDate(order.createdAt)}
        </p>
        {state?.justPlaced && (
          <p className="muted small">
            A confirmation would be sent to <strong>{order.email}</strong> in a real store.
          </p>
        )}
      </div>

      <div className="card">
        <OrderDetails order={order} />
      </div>

      <div className="button-row">
        <Link to="/" className="btn btn--primary">
          Continue shopping
        </Link>
        <Link to={`/orders?email=${encodeURIComponent(order.email)}`} className="btn btn--secondary">
          View order history
        </Link>
      </div>
    </div>
  );
}
