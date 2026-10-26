import { AppError } from '../errors';

/** Thrown when a shopper asks for more units than are available. */
export function insufficientStock(productName: string, available: number, inCart = 0): AppError {
  if (available <= 0) {
    return new AppError(409, 'OUT_OF_STOCK', `Sorry, ${productName} is out of stock.`);
  }
  const already = inCart > 0 ? ` You already have ${inCart} in your cart.` : '';
  return new AppError(
    409,
    'INSUFFICIENT_STOCK',
    `Only ${available} ${productName} ${available === 1 ? 'is' : 'are'} available.${already}`,
  );
}

/** Pure stock rule used by the cart and checkout: can `requested` units be sold given current stock? */
export function hasStockFor(stock: number, requested: number): boolean {
  return Number.isInteger(requested) && requested > 0 && requested <= stock;
}
