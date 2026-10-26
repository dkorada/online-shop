import type { ApiErrorBody, Cart, Category, CheckoutInput, Order, Product, ProductList, ProductSort } from '@shop/shared';

/** An error returned by the API, with optional per-field messages for forms. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      ...init,
      headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'We couldn’t reach the store. Check your connection and try again.');
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = (body as ApiErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.fieldErrors,
    );
  }
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: ProductSort;
  inStock?: boolean;
}

export const api = {
  categories: () => request<Category[]>('/categories'),

  products: (filters: ProductFilters, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.inStock) params.set('inStock', 'true');
    const query = params.toString();
    return request<ProductList>(`/products${query ? `?${query}` : ''}`, { signal });
  },

  product: (slug: string) => request<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`),

  cart: () => request<Cart>('/cart'),
  addToCart: (productId: number, quantity: number) =>
    request<Cart>('/cart/items', { method: 'POST', body: json({ productId, quantity }) }),
  updateCartItem: (productId: number, quantity: number) =>
    request<Cart>(`/cart/items/${productId}`, { method: 'PATCH', body: json({ quantity }) }),
  removeCartItem: (productId: number) => request<Cart>(`/cart/items/${productId}`, { method: 'DELETE' }),

  checkout: (input: CheckoutInput) => request<Order>('/checkout', { method: 'POST', body: json(input) }),
  order: (orderNumber: string, email?: string) =>
    request<Order>(`/orders/${encodeURIComponent(orderNumber)}${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  ordersByEmail: (email: string) => request<Order[]>(`/orders?email=${encodeURIComponent(email)}`),
};
