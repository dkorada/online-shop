import type { ProductSort } from '@shop/shared';
import { FREE_SHIPPING_THRESHOLD_CENTS, formatMoney } from '@shop/shared';
import { PackageSearch, Search, ShieldCheck, Truck, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { Button, EmptyState, ErrorState } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

export function ShopPage() {
  useDocumentTitle();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const sort = (params.get('sort') as ProductSort | null) ?? 'featured';
  const inStock = params.get('inStock') === 'true';
  const urlSearch = params.get('search') ?? '';

  // Typing updates the input immediately; the URL (and the request) follow after a short pause.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  useEffect(() => setSearchInput(urlSearch), [urlSearch]);

  const updateParam = (key: string, value: string | null) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: key === 'search' },
    );
  };

  useEffect(() => {
    if (debouncedSearch !== urlSearch) updateParam('search', debouncedSearch || null);
    // Only react to the debounced value; urlSearch changes are synced into the input above.
  }, [debouncedSearch]);

  const categories = useAsync(() => api.categories(), []);
  const products = useAsync(
    (signal) => api.products({ search: urlSearch, category, sort, inStock }, signal),
    [urlSearch, category, sort, inStock],
  );

  const hasFilters = Boolean(urlSearch || category || inStock);
  const activeCategory = categories.data?.find((c) => c.slug === category);
  const clearFilters = () => {
    setSearchInput('');
    setParams(sort !== 'featured' ? { sort } : {});
  };

  return (
    <>
      {!hasFilters && (
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__copy">
              <span className="eyebrow eyebrow--light">New season essentials</span>
              <h1>Well-made things for everyday living.</h1>
              <p>
                Considered design, honest materials, and fair prices. Free shipping on every order over{' '}
                {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)}.
              </p>
              <a href="#catalog" className="btn btn--light btn--lg">
                Shop the collection
              </a>
            </div>
            <ul className="hero__perks">
              <li>
                <Truck size={20} aria-hidden /> Free shipping over {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)}
              </li>
              <li>
                <RotateCcw size={20} aria-hidden /> 30-day returns
              </li>
              <li>
                <ShieldCheck size={20} aria-hidden /> Secure (simulated) checkout
              </li>
            </ul>
          </div>
        </section>
      )}

      <section id="catalog" className="container section">
        <div className="catalog-header">
          <div>
            <h2 className="section-title">{activeCategory ? activeCategory.name : urlSearch ? 'Search results' : 'All products'}</h2>
            <p className="muted" aria-live="polite">
              {products.loading
                ? 'Loading products…'
                : products.data
                  ? `${products.data.total} ${products.data.total === 1 ? 'product' : 'products'}${urlSearch ? ` for “${urlSearch}”` : ''}`
                  : ''}
            </p>
          </div>
          <div className="toolbar">
            <label className="search-field">
              <Search size={18} aria-hidden />
              <input
                type="search"
                placeholder="Search by name or keyword"
                aria-label="Search products"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
            <select
              className="input select select--compact"
              aria-label="Sort products"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value === 'featured' ? null : e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters">
          <div className="chips" role="group" aria-label="Filter by category">
            <button className={`chip ${!category ? 'chip--active' : ''}`} onClick={() => updateParam('category', null)} aria-pressed={!category}>
              All
            </button>
            {categories.data?.map((c) => (
              <button
                key={c.slug}
                className={`chip ${category === c.slug ? 'chip--active' : ''}`}
                onClick={() => updateParam('category', category === c.slug ? null : c.slug)}
                aria-pressed={category === c.slug}
              >
                {c.name}
                <span className="chip__count">{c.productCount}</span>
              </button>
            ))}
          </div>
          <label className="toggle">
            <input type="checkbox" checked={inStock} onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)} />
            <span className="toggle__track" aria-hidden />
            In stock only
          </label>
          {hasFilters && (
            <button className="link-button" onClick={clearFilters}>
              <X size={14} aria-hidden /> Clear filters
            </button>
          )}
        </div>

        {products.error ? (
          <ErrorState message={products.error.message} onRetry={products.retry} />
        ) : products.loading && !products.data ? (
          <div className="product-grid">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.data && products.data.items.length === 0 ? (
          <EmptyState
            icon={<PackageSearch size={28} aria-hidden />}
            title="No products match your search"
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          >
            Try a different keyword or browse all categories.
          </EmptyState>
        ) : (
          <div className={`product-grid ${products.loading ? 'is-refreshing' : ''}`}>
            {products.data?.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>
    </>
  );
}
