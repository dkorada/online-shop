const LOW_STOCK = 5;

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="badge badge--danger">Sold out</span>;
  if (stock <= LOW_STOCK) return <span className="badge badge--warning">Only {stock} left</span>;
  return <span className="badge badge--success">In stock</span>;
}
