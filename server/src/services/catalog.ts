import type { Prisma } from '@prisma/client';
import type { Category, Product, ProductList, ProductSort } from '@shop/shared';
import { prisma } from '../db';
import { notFound } from '../errors';

const productInclude = { category: { select: { id: true, name: true, slug: true } } } as const;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function toProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    tagline: record.tagline,
    description: record.description,
    priceCents: record.priceCents,
    imageUrl: record.imageUrl,
    stock: record.stock,
    featured: record.featured,
    category: record.category,
  };
}

const sortOrder: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ featured: 'desc' }, { name: 'asc' }],
  'price-asc': [{ priceCents: 'asc' }, { name: 'asc' }],
  'price-desc': [{ priceCents: 'desc' }, { name: 'asc' }],
  name: [{ name: 'asc' }],
};

export interface ProductQuery {
  search?: string;
  category?: string;
  sort?: ProductSort;
  inStock?: boolean;
}

export async function listProducts({ search, category, sort = 'featured', inStock }: ProductQuery): Promise<ProductList> {
  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = { slug: category };
  if (inStock) where.stock = { gt: 0 };
  if (search) {
    // SQLite LIKE is case-insensitive for ASCII, so `contains` gives a friendly search.
    where.OR = [
      { name: { contains: search } },
      { tagline: { contains: search } },
      { description: { contains: search } },
      { category: { name: { contains: search } } },
    ];
  }

  const records = await prisma.product.findMany({ where, include: productInclude, orderBy: sortOrder[sort] });
  return { items: records.map(toProduct), total: records.length };
}

export async function getProductBySlug(slug: string): Promise<{ product: Product; related: Product[] }> {
  const record = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  if (!record) throw notFound('We couldn’t find that product.');

  const related = await prisma.product.findMany({
    where: { categoryId: record.categoryId, id: { not: record.id } },
    include: productInclude,
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    take: 4,
  });

  return { product: toProduct(record), related: related.map(toProduct) };
}

export async function listCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return categories.map(({ _count, ...category }) => ({ ...category, productCount: _count.products }));
}
