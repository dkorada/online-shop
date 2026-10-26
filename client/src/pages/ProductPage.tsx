import { formatMoney } from '@shop/shared';
import { ChevronRight, PackageX, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { QuantityStepper } from '../components/QuantityStepper';
import { StockBadge } from '../components/StockBadge';
import { Button, EmptyState, ErrorState, Skeleton } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MAX_PER_ORDER = 10;

export function ProductPage() {
  const { slug = '' } = useParams();
  const { data, error, loading, retry } = useAsync(() => api.product(slug), [slug]);
  const { addItem, pending, quantityInCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useDocumentTitle(data?.product.name);
  useEffect(() => setQuantity(1), [slug]);

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="container section">
          <EmptyState
            icon={<PackageX size={28} aria-hidden />}
            title="Product not found"
            action={
              <Link className="btn btn--primary" to="/">
                Back to the shop
              </Link>
            }
          >
            It may have been removed or the link is incorrect.
          </EmptyState>
        </div>
      );
    }
    return (
      <div className="container section">
        <ErrorState message={error.message} onRetry={retry} />
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="container section product-detail" aria-busy>
        <Skeleton className="skeleton--media product-detail__media" />
        <div className="product-detail__info">
          <Skeleton className="skeleton--text skeleton--short" />
          <Skeleton className="skeleton--title" />
          <Skeleton className="skeleton--text skeleton--long" />
          <Skeleton className="skeleton--text" />
        </div>
      </div>
    );
  }

  const { product, related } = data;
  const inCart = quantityInCart(product.id);
  const remaining = Math.max(0, Math.min(product.stock, MAX_PER_ORDER) - inCart);
  const soldOut = product.stock <= 0;

  const handleAdd = async () => {
    if (await addItem(product.id, quantity, product.name)) setQuantity(1);
  };

  return (
    <div className="container section">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Shop</Link>
        <ChevronRight size={14} aria-hidden />
        <Link to={`/?category=${product.category.slug}`}>{product.category.name}</Link>
        <ChevronRight size={14} aria-hidden />
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail">
        <div className="product-detail__media">
          <img src={product.imageUrl} alt={product.name} width={800} height={800} />
        </div>
        <div className="product-detail__info">
          <span className="eyebrow">{product.category.name}</span>
          <h1 className="product-detail__title">{product.name}</h1>
          <p className="product-detail__tagline">{product.tagline}</p>
          <div className="product-detail__price-row">
            <span className="price price--lg">{formatMoney(product.priceCents)}</span>
            <StockBadge stock={product.stock} />
          </div>
          <p className="product-detail__description">{product.description}</p>

          <div className="purchase-box">
            {soldOut ? (
              <p className="notice notice--warning">This item is sold out. Check back soon.</p>
            ) : remaining === 0 ? (
              <p className="notice">
                You have the maximum available quantity ({inCart}) in your cart. <Link to="/cart">View cart</Link>
              </p>
            ) : (
              <div className="purchase-box__row">
                <QuantityStepper
                  label="Quantity"
                  value={Math.min(quantity, remaining)}
                  max={remaining}
                  onChange={setQuantity}
                  disabled={pending.has(product.id)}
                />
                <Button size="lg" block loading={pending.has(product.id)} onClick={handleAdd}>
                  {!pending.has(product.id) && <ShoppingBag size={18} aria-hidden />}
                  Add to cart · {formatMoney(product.priceCents * Math.min(quantity, remaining))}
                </Button>
              </div>
            )}
            {inCart > 0 && remaining > 0 && (
              <p className="small muted">
                {inCart} already in your cart. <Link to="/cart">View cart</Link>
              </p>
            )}
          </div>

          <ul className="assurances">
            <li>
              <Truck size={18} aria-hidden /> Ships in 1–2 business days
            </li>
            <li>
              <RotateCcw size={18} aria-hidden /> Free 30-day returns
            </li>
            <li>
              <ShieldCheck size={18} aria-hidden /> Secure checkout (simulated payments)
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--tight">
          <h2 className="section-title">You might also like</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
