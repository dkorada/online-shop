/** Response shapes shared between the API and the React client. */
import type { Totals } from './pricing';

export interface Category {
  id: number;
  name: string;
  slug: string;
  productCount?: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  featured: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
}

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'name';

export interface ProductList {
  items: Product[];
  total: number;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  stock: number;
  /** False when stock dropped below the quantity in the cart after it was added. */
  available: boolean;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  totals: Totals;
}

export interface OrderItem {
  productId: number | null;
  productName: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

export interface Order {
  orderNumber: string;
  status: 'PAID';
  email: string;
  fullName: string;
  phone: string;
  shippingAddress: {
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  paymentBrand: string;
  paymentLast4: string;
  createdAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
}
