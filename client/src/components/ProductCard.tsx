import type { Product } from '@shop/shared';
import { formatMoney } from '@shop/shared';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { StockBadge } from './StockBadge';
import { Button, Skeleton } from './ui';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, pending, quantityInCart } = useCart();
  const soldOut = product.stock <= 0;
  const maxedOut = !soldOut && quantityInCart(product.id) >= product.stock;

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card__media">
        <img src={product.imageUrl} alt={product.name} loading="lazy" width={400} height={400} />
        {product.featured && <span className="product-card__flag">Bestseller</span>}
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="eyebrow">{product.category.name}</span>
          <StockBadge stock={product.stock} />
        </div>
        <h3 className="product-card__title">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-card__tagline">{product.tagline}</p>
        <div className="product-card__footer">
          <span className="price">{formatMoney(product.priceCents)}</span>
          <Button
            size="sm"
            variant={soldOut || maxedOut ? 'secondary' : 'primary'}
            disabled={soldOut || maxedOut}
            loading={pending.has(product.id)}
            onClick={() => addItem(product.id, 1, product.name)}
            aria-label={`Add ${product.name} to cart`}
          >
            {!pending.has(product.id) && <ShoppingBag size={15} aria-hidden />}
            {soldOut ? 'Sold out' : maxedOut ? 'All in cart' : 'Add'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card--skeleton" aria-hidden>
      <Skeleton className="skeleton--media" />
      <div className="product-card__body">
        <Skeleton className="skeleton--text skeleton--short" />
        <Skeleton className="skeleton--text" />
        <Skeleton className="skeleton--text skeleton--long" />
      </div>
    </div>
  );
}
