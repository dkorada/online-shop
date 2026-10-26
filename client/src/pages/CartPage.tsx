import { formatMoney } from '@shop/shared';
import { AlertTriangle, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FreeShippingProgress, SummaryCard, TotalsTable } from '../components/OrderSummary';
import { QuantityStepper } from '../components/QuantityStepper';
import { Button, EmptyState, Skeleton, Spinner } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MAX_PER_ORDER = 10;

export function CartPage() {
  useDocumentTitle('Your cart');
  const navigate = useNavigate();
  const { cart, loading, pending, updateQuantity, removeItem } = useCart();

  if (loading && !cart) {
    return (
      <div className="container section">
        <h1 className="page-title">Your cart</h1>
        <div className="cart-layout">
          <div className="card">
            <Skeleton className="skeleton--row" />
            <Skeleton className="skeleton--row" />
          </div>
          <Skeleton className="skeleton--panel" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          icon={<ShoppingBag size={28} aria-hidden />}
          title="Your cart is empty"
          action={
            <Link to="/" className="btn btn--primary">
              Start shopping
            </Link>
          }
        >
          Browse the collection and add something you love.
        </EmptyState>
      </div>
    );
  }

  const unavailable = cart.items.filter((item) => !item.available);

  return (
    <div className="container section">
      <h1 className="page-title">
        Your cart <span className="muted page-title__count">({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
      </h1>
      <div className="cart-layout">
        <div className="card cart-items">
          {unavailable.length > 0 && (
            <div className="notice notice--warning" role="alert">
              <AlertTriangle size={18} aria-hidden />
              Some items have limited stock now. Lower the quantity or remove them to continue.
            </div>
          )}
          <ul>
            {cart.items.map((item) => {
              const busy = pending.has(item.productId);
              return (
                <li key={item.productId} className={`cart-item ${busy ? 'is-busy' : ''}`}>
                  <Link to={`/products/${item.slug}`} className="cart-item__media">
                    <img src={item.imageUrl} alt="" width={96} height={96} />
                  </Link>
                  <div className="cart-item__info">
                    <Link to={`/products/${item.slug}`} className="cart-item__name">
                      {item.name}
                    </Link>
                    <span className="muted small">{formatMoney(item.unitPriceCents)} each</span>
                    {!item.available && (
                      <span className="field__error">
                        {item.stock === 0 ? 'Sold out' : `Only ${item.stock} available`}
                      </span>
                    )}
                  </div>
                  <div className="cart-item__controls">
                    <QuantityStepper
                      size="sm"
                      label={`Quantity for ${item.name}`}
                      value={item.quantity}
                      min={1}
                      max={Math.max(1, Math.min(item.stock, MAX_PER_ORDER))}
                      onChange={(q) => updateQuantity(item.productId, q)}
                      disabled={busy}
                    />
                    <button
                      className="icon-button icon-button--danger"
                      onClick={() => removeItem(item.productId)}
                      disabled={busy}
                      aria-label={`Remove ${item.name}`}
                    >
                      {busy ? <Spinner size={16} /> : <Trash2 size={18} />}
                    </button>
                  </div>
                  <span className="cart-item__total">{formatMoney(item.lineTotalCents)}</span>
                </li>
              );
            })}
          </ul>
          <Link to="/" className="link-button">
            ← Continue shopping
          </Link>
        </div>

        <SummaryCard>
          <FreeShippingProgress totals={cart.totals} />
          <TotalsTable totals={cart.totals} />
          <Button size="lg" block disabled={unavailable.length > 0} onClick={() => navigate('/checkout')}>
            Checkout <ArrowRight size={18} aria-hidden />
          </Button>
          <p className="small muted center">Taxes and shipping calculated above. Payments are simulated.</p>
        </SummaryCard>
      </div>
    </div>
  );
}
