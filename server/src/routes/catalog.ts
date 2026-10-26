import { Router } from 'express';
import { z } from 'zod';
import { getProductBySlug, listCategories, listProducts } from '../services/catalog';

const productQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'name']).optional(),
  inStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export const catalogRouter = Router();

catalogRouter.get('/categories', async (_req, res) => {
  res.json(await listCategories());
});

catalogRouter.get('/products', async (req, res) => {
  const query = productQuerySchema.parse(req.query);
  res.json(await listProducts({ ...query, search: query.search || undefined, category: query.category || undefined }));
});

catalogRouter.get('/products/:slug', async (req, res) => {
  res.json(await getProductBySlug(req.params.slug));
});
