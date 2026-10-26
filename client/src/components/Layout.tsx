import { ShoppingBag, Search, Package } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FREE_SHIPPING_THRESHOLD_CENTS, formatMoney } from '@shop/shared';
import { useCart } from '../context/CartContext';

function HeaderSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get('search') ?? '');

  useEffect(() => setValue(params.get('search') ?? ''), [params]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (value.trim()) next.set('search', value.trim());
    navigate({ pathname: '/', search: next.toString() });
  };

  return (
    <form className="header-search" role="search" onSubmit={submit}>
      <Search size={18} aria-hidden />
      <input
        type="search"
        placeholder="Search products"
        aria-label="Search products"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

export function Layout() {
  const { cart } = useCart();
  const { pathname } = useLocation();
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        Free shipping on orders over {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)} · Demo store, no real payments are taken
      </div>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand" aria-label="Kindred Goods home">
            <span className="brand__mark" aria-hidden>
              K
            </span>
            <span className="brand__name">Kindred Goods</span>
          </Link>
          <HeaderSearch />
          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" end className="site-nav__link">
              Shop
            </NavLink>
            <NavLink to="/orders" className="site-nav__link">
              <Package size={18} aria-hidden />
              <span className="hide-sm">Orders</span>
            </NavLink>
            <NavLink to="/cart" className="site-nav__link cart-link" aria-label={`Cart, ${count} items`}>
              <ShoppingBag size={20} aria-hidden />
              <span className="hide-sm">Cart</span>
              {count > 0 && <span className="cart-link__badge">{count}</span>}
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div>
            <div className="brand brand--footer">
              <span className="brand__mark" aria-hidden>
                K
              </span>
              <span className="brand__name">Kindred Goods</span>
            </div>
            <p className="muted">Thoughtfully designed everyday essentials.</p>
          </div>
          <p className="muted small">
            This is a demonstration store. Products are samples and payments are simulated, so no card is ever charged.
          </p>
        </div>
      </footer>
    </div>
  );
}
