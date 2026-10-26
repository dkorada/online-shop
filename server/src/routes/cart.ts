import { Router } from 'express';
import { z } from 'zod';
import { addItem, getCart, removeItem, updateItemQuantity } from '../services/cart';

const productIdParam = z.coerce.number().int().positive();
const addSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});
const updateSchema = z.object({ quantity: z.number().int().min(0, 'Quantity cannot be negative') });

export const cartRouter = Router();

cartRouter.get('/', async (req, res) => {
  res.json(await getCart(req.sessionId));
});

cartRouter.post('/items', async (req, res) => {
  const { productId, quantity } = addSchema.parse(req.body);
  res.status(201).json(await addItem(req.sessionId, productId, quantity));
});

cartRouter.patch('/items/:productId', async (req, res) => {
  const productId = productIdParam.parse(req.params.productId);
  const { quantity } = updateSchema.parse(req.body);
  res.json(await updateItemQuantity(req.sessionId, productId, quantity));
});

cartRouter.delete('/items/:productId', async (req, res) => {
  const productId = productIdParam.parse(req.params.productId);
  res.json(await removeItem(req.sessionId, productId));
});
