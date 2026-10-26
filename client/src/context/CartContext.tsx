import type { Cart } from '@shop/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import { useToast } from './ToastContext';

interface CartApi {
  cart: Cart | undefined;
  loading: boolean;
  /** Product ids with a request in flight, so buttons can show progress. */
  pending: ReadonlySet<number>;
  addItem: (productId: number, quantity: number, productName: string) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
  quantityInCart: (productId: number) => number;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [cart, setCart] = useState<Cart>();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<ReadonlySet<number>>(new Set());

  const refresh = useCallback(async () => {
    try {
      setCart(await api.cart());
    } catch {
      // The header simply shows no count; pages that need the cart surface their own errors.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const track = useCallback(async <T,>(productId: number, work: () => Promise<T>) => {
    setPending((ids) => new Set(ids).add(productId));
    try {
      return await work();
    } finally {
      setPending((ids) => {
        const next = new Set(ids);
        next.delete(productId);
        return next;
      });
    }
  }, []);

  const reportError = useCallback(
    (error: unknown) => {
      toast.show({ tone: 'error', message: error instanceof ApiError ? error.message : 'Something went wrong. Please try again.' });
    },
    [toast],
  );

  const addItem = useCallback(
    (productId: number, quantity: number, productName: string) =>
      track(productId, async () => {
        try {
          setCart(await api.addToCart(productId, quantity));
          toast.show({
            tone: 'success',
            message: `${quantity > 1 ? `${quantity} × ` : ''}${productName} added to your cart`,
            action: { label: 'View cart', to: '/cart' },
          });
          return true;
        } catch (error) {
          reportError(error);
          return false;
        }
      }),
    [track, toast, reportError],
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) =>
      track(productId, async () => {
        try {
          setCart(await api.updateCartItem(productId, quantity));
        } catch (error) {
          reportError(error);
          await refresh();
        }
      }),
    [track, reportError, refresh],
  );

  const removeItem = useCallback(
    (productId: number) =>
      track(productId, async () => {
        try {
          setCart(await api.removeCartItem(productId));
        } catch (error) {
          reportError(error);
        }
      }),
    [track, reportError],
  );

  const quantityInCart = useCallback(
    (productId: number) => cart?.items.find((item) => item.productId === productId)?.quantity ?? 0,
    [cart],
  );

  const value = useMemo(
    () => ({ cart, loading, pending, addItem, updateQuantity, removeItem, refresh, quantityInCart }),
    [cart, loading, pending, addItem, updateQuantity, removeItem, refresh, quantityInCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
