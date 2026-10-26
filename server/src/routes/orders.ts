import { Router } from 'express';
import { z } from 'zod';
import { checkoutSchema, emailSchema } from '@shop/shared';
import { placeOrder } from '../services/checkout';
import { getOrder, listOrdersByEmail } from '../services/orders';

export const ordersRouter = Router();

ordersRouter.post('/checkout', async (req, res) => {
  const data = checkoutSchema.parse(req.body);
  res.status(201).json(await placeOrder(req.sessionId, data));
});

ordersRouter.get('/orders', async (req, res) => {
  const { email } = z.object({ email: emailSchema }).parse(req.query);
  res.json(await listOrdersByEmail(email));
});

ordersRouter.get('/orders/:orderNumber', async (req, res) => {
  const { email } = z.object({ email: z.string().optional() }).parse(req.query);
  res.json(await getOrder(req.params.orderNumber.toUpperCase(), { sessionId: req.sessionId, email }));
});
