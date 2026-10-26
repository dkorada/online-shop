import { calculateTotals, FLAT_SHIPPING_CENTS, TEST_CARDS } from '@shop/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FreeShippingProgress, TotalsTable } from '../components/OrderSummary';
import { StockBadge } from '../components/StockBadge';
import { TestCardPanel } from '../components/TestCardPanel';

describe('StockBadge', () => {
  it.each([
    [0, 'Sold out'],
    [3, 'Only 3 left'],
    [20, 'In stock'],
  ])('shows the right label for %i units', (stock, label) => {
    render(<StockBadge stock={stock} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('TotalsTable', () => {
  it('shows subtotal, 10% tax, flat shipping and total', () => {
    render(<TotalsTable totals={calculateTotals([{ unitPriceCents: 2500, quantity: 2 }])} />);
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(screen.getByText(`$${(FLAT_SHIPPING_CENTS / 100).toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('$62.99')).toBeInTheDocument();
  });

  it('labels shipping as free above the threshold', () => {
    render(<TotalsTable totals={calculateTotals([{ unitPriceCents: 10000, quantity: 1 }])} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});

describe('FreeShippingProgress', () => {
  it('tells the shopper how much more to spend', () => {
    render(<FreeShippingProgress totals={calculateTotals([{ unitPriceCents: 5000, quantity: 1 }])} />);
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });
});

describe('TestCardPanel', () => {
  it('fills in the chosen test card', async () => {
    const onUse = vi.fn();
    render(<TestCardPanel onUse={onUse} />);
    await userEvent.click(screen.getByText('Payment is declined'));
    expect(onUse).toHaveBeenCalledWith(TEST_CARDS.declined);
  });
});
